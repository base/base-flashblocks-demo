import { useEffect, useState } from 'react';
import { Block, SubBlock } from "@/utils/block-utils";
import {parseTransaction} from 'viem/op-stack';
import {OpStackTransactionSerialized} from "viem/chains";
import {keccak256, TransactionRequestBase} from "viem";


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

interface NetworkState extends State {
    websocketUrl: string;
}

const clamp = (data: Block[]): Block[] => {
    if (data.length > 25) {
        return data.slice(0, 25);
    }
    return data;
}

let brotliDecoder: typeof import('brotli-dec-wasm/web') | undefined;

export const useFlashblocks = (websocketUrl: string): State => {
    if (!websocketUrl) {
        throw new Error("No websocket URL provided");
    }

    const [state, setState] = useState<NetworkState>({
        websocketUrl,
        blocks: [],
        pendingBlock: undefined,
    });

    // Reset even if the next network has not received a message yet.
    if (state.websocketUrl !== websocketUrl) {
        setState({ websocketUrl, blocks: [], pendingBlock: undefined });
    }

    useEffect(() => {
        let active = true;
        const controller = new AbortController();
        let messageQueue = Promise.resolve();
        let decoderRetryAfter = 0;
        const ws = new WebSocket(websocketUrl);

        const handleMessage = async (event: MessageEvent<Blob | string>) => {
            if (!active) return;
            const textData = typeof event.data === 'string' ? event.data : await event.data.text();
            let newFlashBlock: Flashblock | undefined;
            if (typeof event.data === 'string' || textData.trim().startsWith("{")) {
                newFlashBlock = JSON.parse(textData) as Flashblock;
            } else {
                let decoderTimedOut = false;
                try {
                    // Initialize only in the browser. A failed fetch can be retried by a later frame.
                    if (!brotliDecoder) {
                        if (Date.now() < decoderRetryAfter) return;
                        const decoder = await import('brotli-dec-wasm/web');
                        if (!active) return;
                        const initController = new AbortController();
                        const abortInit = () => initController.abort();
                        controller.signal.addEventListener('abort', abortInit, { once: true });
                        const timer = setTimeout(() => {
                            decoderTimedOut = true;
                            initController.abort();
                        }, 10000);
                        try {
                            const wasmUrl = new URL('brotli-dec-wasm/web/bg.wasm', import.meta.url);
                            await decoder.default(fetch(wasmUrl, { signal: initController.signal }));
                        } finally {
                            clearTimeout(timer);
                            controller.signal.removeEventListener('abort', abortInit);
                        }
                        brotliDecoder = decoder;
                    }
                    const arrayBuffer = await event.data.arrayBuffer();
                    const u8Data = new Uint8Array(arrayBuffer);
                    const decompressedData = new TextDecoder().decode(brotliDecoder.decompress(u8Data));
                    newFlashBlock = JSON.parse(decompressedData) as Flashblock;
                } catch (decompressError) {
                    if (decoderTimedOut) {
                        decoderRetryAfter = Date.now() + 10000;
                    }
                    // A missing frame makes the current block incomplete; wait for a fresh start.
                    if (active) {
                        setState((state) => state.websocketUrl === websocketUrl
                            ? { ...state, pendingBlock: undefined }
                            : state);
                    }
                    console.error("Error decompressing data", decompressError)
                    return
                }
            }

            if (!active) return;

            setState((state) => {
                const { blocks, pendingBlock } = state.websocketUrl === websocketUrl
                    ? state
                    : { blocks: [], pendingBlock: undefined };

                if (pendingBlock == undefined && newFlashBlock.index === 0) {
                    return {
                        websocketUrl,
                        pendingBlock: flashBlockToBlock(newFlashBlock),
                        blocks: clamp([...blocks]),
                    };
                } else if (newFlashBlock.index === 0) {
                    return {
                        websocketUrl,
                        pendingBlock: flashBlockToBlock(newFlashBlock),
                        blocks: clamp([pendingBlock, ...blocks].filter(b => b !== undefined)),
                    };
                } else if (pendingBlock !== undefined) {
                    return {
                        websocketUrl,
                        pendingBlock: updateBlock(pendingBlock, newFlashBlock),
                        blocks: clamp([...blocks]),
                    };
                } else {
                    console.log("waiting for block start")
                    return state;
                }
            });
        };

        // Decoding is asynchronous; preserve arrival order while WASM loads.
        ws.onmessage = (event: MessageEvent<Blob | string>) => {
            messageQueue = messageQueue
                .then(() => handleMessage(event))
                .catch((error) => console.error('Error processing flashblock:', error));
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        return () => {
            active = false;
            controller.abort();
            ws.close();
        };
    }, [websocketUrl]);

    // Never expose a previous network's blocks while the new socket is connecting.
    return state.websocketUrl === websocketUrl ? state : { blocks: [], pendingBlock: undefined };
};