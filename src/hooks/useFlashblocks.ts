import {useEffect, useState} from 'react';
import {Block, SubBlock} from "@/utils/block-utils";
import {parseTransaction} from 'viem/op-stack';
import {OpStackTransactionSerialized} from "viem/chains";
import {TransactionRequestBase} from "viem";
import { keccak256 } from 'viem'
import { toRlp } from 'viem'

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
        receipts: Record<string, any>;
    };
}



export function flashBlockToBlock(flashBlock: Flashblock): Block {
    const block: Block = {
        blockNumber: Number(flashBlock.base.block_number),
        timestamp: Number(flashBlock.base.timestamp),
        transactions: [],
        subBlocks: [{
            blockNumber: 1,
            transactions: [],
            transactionHashes: [],
        }],
    };

    flashBlock.diff.transactions.map((t ) => {
        const tx = parseTransaction(t as OpStackTransactionSerialized) as TransactionRequestBase;
        block.subBlocks[0].transactions.push({
            from: tx.from || "",
            to: tx.to || "",
            value: tx.value ? tx.value : BigInt(0),
        });
    });

    block.subBlocks[0].transactionHashes = Object.keys(flashBlock.metadata.receipts);

    return block;
}

function updateBlock(block: Block, flashBlock: Flashblock): Block {
    const newSubBlock: SubBlock = {
        blockNumber: flashBlock.index,
        transactions: [],
        transactionHashes: [],
    };

    flashBlock.diff.transactions.map((t) => {
        // const tx = parseTransaction(t as OpStackTransactionSerialized) as TransactionRequestBase;
        console.log("DAN TX", t);
        const tx = parseTransaction(t as OpStackTransactionSerialized<'eip1559'>) ;
        console.log("DAN", tx);
        // toRlp(tx);

        0xf86c54830f433a82520894557bb85fc501616668d39d82aaa9b25027e9e296865af3107a400080840166fb24a04a21a3542c8380d9e973dc604521ccbc91013fc494cf939ea13efcf7acd16a7da03955b2d88aa08611434b02101f4259606538054be19ffe2c15ff94e2a64cefa1

        newSubBlock.transactions.push({
            from: "",
            to: tx.to || "",
            value: tx.value ? tx.value : BigInt(0),
        });
    })

    newSubBlock.transactionHashes = Object.keys(flashBlock.metadata.receipts);

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

        ws.onmessage = async (event) => {
            const newFlashBlock: Flashblock = JSON.parse(await event.data.text());

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
    }, [url]);

    return state;
};