import { useEffect, useState } from 'react';
import { Block, SubBlock } from "@/utils/block-utils";
import {parseTransaction} from 'viem/op-stack';
import {OpStackTransactionSerialized} from "viem/chains";
import {keccak256, TransactionRequestBase} from "viem";
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
        transactions: string[];
    };
    metadata: {
        receipts: Record<string, unknown>;
    };
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
    for (const t of flashblock.diff.transactions) {
        try {
            const tx = parseTransaction(t as OpStackTransactionSerialized) as TransactionRequestBase;
            subBlock.transactions.push({
                hash: keccak256(t as `0x{string}`),
                from: tx.from || "",
                to: tx.to || "",
                value: tx.value ? tx.value : BigInt(0),
            });
        } catch (e) {
            // Don't crash on parse failures
            console.error(e);
        }
    }

    subBlock.transactionHashes = Object.keys(flashblock.metadata.receipts);
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

        ws.onmessage = async (event: MessageEvent<Blob>) => {
            const brotli = await brotliPromise;
            const textData = await event.data.text()
            let newFlashBlock: Flashblock | undefined;
            if (textData.trim().startsWith("{")) {
                newFlashBlock = JSON.parse(textData) as Flashblock;
            } else {
                try {
                    const arrayBuffer = await event.data.arrayBuffer()
                    const u8Data = new Uint8Array(arrayBuffer)
                    const decompressedData = Buffer.from(brotli.decompress(u8Data)).toString("utf-8")
                    newFlashBlock = JSON.parse(decompressedData) as Flashblock;
                } catch (decompressError) {
                    console.error("Error decompressing data", decompressError)
                    return
                }
            }

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