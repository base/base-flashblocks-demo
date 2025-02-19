import {useEffect, useState} from 'react';
import {Block, SubBlock} from "@/utils/block-utils";
import {parseTransaction} from 'viem/op-stack';
import {OpStackTransactionSerialized} from "viem/chains";
import type {TransactionRequestBase} from "viem";

type HexString = string;

interface ExecutionPayload {
    baseFeePerGas: HexString;
    blobGasUsed: HexString;
    blockHash: HexString;
    blockNumber: HexString;
    excessBlobGas: HexString;
    extraData: HexString;
    feeRecipient: HexString;
    gasLimit: HexString;
    gasUsed: HexString;
    logsBloom: HexString;
    parentHash: HexString;
    prevRandao: HexString;
    receiptsRoot: HexString;
    stateRoot: HexString;
    timestamp: HexString;
    transactions: HexString[];
}

interface Response {
    blockValue: HexString;
    executionPayload: ExecutionPayload;
    parentBeaconBlockRoot: HexString;
    shouldOverrideBuilder: boolean;
}

interface Flashblock {
    response: Response;
    tx_hashes: HexString[];
}

export function flashBlockToBlock(flashBlock: Flashblock): Block {
    const block: Block = {
        blockNumber: Number(flashBlock.response.executionPayload.blockNumber),
        timestamp: Number(flashBlock.response.executionPayload.timestamp),
        transactions: [],
        subBlocks: [{
            blockNumber: 1,
            transactions: [],
        }],
    };

    flashBlock.tx_hashes.map((hash, idx) => {
        const tx = parseTransaction(flashBlock.response.executionPayload.transactions[idx] as OpStackTransactionSerialized) as TransactionRequestBase;
        block.subBlocks[0].transactions.push({
            hash: hash,
            from: tx.from || "",
            to: tx.to || "",
            value: "0.01",
        });
    });

    return block;
}

function updateBlock(block: Block, flashBlock: Flashblock): Block {
    const newSubBlock: SubBlock = {
        blockNumber: block.subBlocks.length + 1,
        transactions: [],
    };

    const seenHashes = new Set(block.subBlocks.flatMap((subBlock) => subBlock.transactions.map((tx) => tx.hash)));

    flashBlock.tx_hashes.map((hash, idx) => {
        const tx = parseTransaction(flashBlock.response.executionPayload.transactions[idx] as OpStackTransactionSerialized) as TransactionRequestBase;
        if (seenHashes.has(hash)) {
            return;
        }

        newSubBlock.transactions.push({
            hash: hash,
            from: tx.from || "",
            to: tx.to || "",
            value: "0.01",
        });
    })

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

export const useFlashblocks = (): State => {
    const url = process.env.NEXT_PUBLIC_WEBSOCKET_URL
    if (!url) {
        throw new Error("No websocket URL provided");
    }

    const [state, setState] = useState<State>({
        blocks: [],
        pendingBlock: undefined,
    });

    useEffect(() => {
        const ws = new WebSocket(url);

        ws.onmessage = (event) => {
            const newFlashBlock = JSON.parse(event.data);
            const newFlashBlockNumber = Number(newFlashBlock.response.executionPayload.blockNumber);

            setState((state) => {
                const { blocks, pendingBlock } = state;

                if (pendingBlock == undefined) {
                    return {
                        pendingBlock: flashBlockToBlock(newFlashBlock),
                        blocks: clamp([...blocks]),
                    };
                } else if (pendingBlock?.blockNumber < newFlashBlockNumber) {
                    return {
                        pendingBlock: flashBlockToBlock(newFlashBlock),
                        blocks: clamp([pendingBlock, ...blocks]),
                    };
                } else if (pendingBlock?.blockNumber === newFlashBlockNumber) {
                    return {
                        pendingBlock: updateBlock(pendingBlock, newFlashBlock),
                        blocks: clamp([...blocks]),
                    };
                } else {
                    console.error("Unexpected block number", pendingBlock?.blockNumber, newFlashBlockNumber);
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
    }, [url]);

    return state;
};