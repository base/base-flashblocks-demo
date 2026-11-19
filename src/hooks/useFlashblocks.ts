import { useEffect, useState } from 'react';
import { Block, SubBlock } from "@/utils/block-utils";
import {parseTransaction} from 'viem/op-stack';
import {OpStackTransactionSerialized} from "viem/chains";
import {Hex, keccak256, TransactionRequestBase} from "viem";
import brotliPromise from 'brotli-dec-wasm';


interface Flashblock {
    payload_id: string;
    index: number;
    base: {
        parent_beacon_block_root: string;
        parent_hash: string;
        fee_recipient: string;
        prev_randao: string;
        block_number: string;
        gas_limit: string;
        timestamp: string;
        extra_data: string;
        base_fee_per_gas: string;
    };
    diff: {
        state_root: string;
        receipts_root: string;
        logs_bloom: string;
        gas_used: string;
        block_hash: string;
        transactions?: string[];
    };
    metadata?: {
        receipts?: Record<string, unknown> | null;
    };
}

const textDecoder = new TextDecoder();

function transactionHash(transaction: string): string {
    return keccak256(transaction as Hex);
}

export function flashBlockToBlock(flashBlock: Flashblock): Block {
    const block: Block = {
        blockNumber: Number(flashBlock.base.block_number),
        timestamp: Number(flashBlock.base.timestamp),
        subBlocks: [{
            blockNumber: 1,
            transactions: [],
            transactionHashes: [],
        }],
    };

    convertBlock(flashBlock, block.subBlocks[0]);
    return block;
}

function convertBlock(flashblock: Flashblock, subBlock: SubBlock) {
    const transactions = flashblock.diff.transactions ?? [];
    const transactionHashes: string[] = [];
    const receiptHashes = flashblock.metadata?.receipts
        ? Object.keys(flashblock.metadata.receipts)
        : undefined;

    for (const t of transactions) {
        try {
            const hash = transactionHash(t);
            transactionHashes.push(hash);
            const tx = parseTransaction(t as OpStackTransactionSerialized) as TransactionRequestBase;
            subBlock.transactions.push({
                hash,
                from: tx.from || "",
                to: tx.to || "",
                value: tx.value ? tx.value : BigInt(0),
            });
        } catch (e) {
            // Don't crash on parse failures
            console.error(e);
        }
    }

    subBlock.transactionHashes = receiptHashes ?? transactionHashes;
}

async function decodeFlashblockMessage(event: MessageEvent): Promise<Flashblock | undefined> {
    if (typeof event.data === "string") {
        return JSON.parse(event.data) as Flashblock;
    }

    if (!(event.data instanceof Blob) && !(event.data instanceof ArrayBuffer)) {
        console.error("Unsupported WebSocket message type", typeof event.data);
        return undefined;
    }

    const arrayBuffer = event.data instanceof Blob
        ? await event.data.arrayBuffer()
        : event.data;
    const u8Data = new Uint8Array(arrayBuffer);
    const textData = textDecoder.decode(u8Data);

    if (textData.trim().startsWith("{")) {
        return JSON.parse(textData) as Flashblock;
    }

    try {
        const brotli = await brotliPromise;
        const decompressedData = textDecoder.decode(brotli.decompress(u8Data));
        return JSON.parse(decompressedData) as Flashblock;
    } catch (decompressError) {
        console.error("Error decompressing data", decompressError)
        return undefined;
    }
}

function updateBlock(block: Block, flashBlock: Flashblock): Block {
    const newSubBlock: SubBlock = {
        blockNumber: flashBlock.index,
        transactions: [],
        transactionHashes: [],
    };

    convertBlock(flashBlock, newSubBlock);
    return {
        ...block,
        subBlocks: [...block.subBlocks, newSubBlock],
    };
}

interface State {
    blocks: Block[]
    pendingBlock?: Block
}

const clamp = (data: Block[]): Block[] => {
    if (data.length > 25) {
        return data.slice(0, 25);
    }
    return data;
}

export const useFlashblocks = (websocketUrl: string): State => {
    if (!websocketUrl) {
        throw new Error("No websocket URL provided");
    }

    const [state, setState] = useState<State>({
        blocks: [],
        pendingBlock: undefined,
    });

    useEffect(() => {
        setState({
            blocks: [],
            pendingBlock: undefined,
        });
    }, [websocketUrl]);

    useEffect(() => {
        const ws = new WebSocket(websocketUrl);

        ws.onmessage = async (event: MessageEvent) => {
            const newFlashBlock = await decodeFlashblockMessage(event);
            if (!newFlashBlock) return;

            setState((state) => {
                const { blocks, pendingBlock } = state;

                if (pendingBlock == undefined && newFlashBlock.index === 0) {
                    return {
                        pendingBlock: flashBlockToBlock(newFlashBlock),
                        blocks: clamp([...blocks]),
                    };
                } else if (newFlashBlock.index === 0) {
                    return {
                        pendingBlock: flashBlockToBlock(newFlashBlock),
                        blocks: clamp([pendingBlock, ...blocks].filter(b => b !== undefined)),
                    };
                } else if (pendingBlock !== undefined) {
                    return {
                        pendingBlock: updateBlock(pendingBlock, newFlashBlock),
                        blocks: clamp([...blocks]),
                    };
                } else {
                    console.log("waiting for block start")
                    return state;
                }
            });
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        return () => {
            ws.close();
        };
    }, [websocketUrl]);

    return state;
};
