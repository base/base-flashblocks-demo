import type {NextApiRequest, NextApiResponse} from 'next'
import {BaseError, BlockNotFoundError, createPublicClient, http} from 'viem'
import {base} from 'viem/chains'
import {Block, Transaction} from "@/utils/block-utils";

type Data = {
    success: boolean
    data?: Block
    error?: string
}

if (!process.env.BASE_RPC_URL) {
    throw new Error('BASE_RPC_URL is not defined')
}

const client = createPublicClient({
    chain: base,
    transport: http(process.env.BASE_RPC_URL)
})

export async function getBlock(blockNumber?: string): Promise<Data> {
    try {
        let args = {
            blockTag: 'latest'
        };

        let block;
        if (blockNumber) {
            block = await client.getBlock({
                blockNumber: BigInt(blockNumber as string),
                includeTransactions: true
            });
        } else {
            block = await client.getBlock({
                blockTag: 'latest',
                includeTransactions: true
            });
        }

        const txns = block.transactions.map((txn) => {
            return {
                hash: txn.hash,
                from: txn.from,
                to: txn.to || "",
                value: txn.value.toString()
            }
        });

        return {
            success: true,
            data: {
                blockNumber: Number(block.number),
                timestamp: Number(block.timestamp),
                transactions: txns,
                subBlocks: [],
            }
        }
    } catch (error) {
        if (error instanceof BlockNotFoundError) {
            return {
                success: false,
                error: 'Block not found'
            }
        }
        if (error instanceof BaseError) {
            return {
                success: false,
                error: error.message
            }
        }
        return {
            success: false,
            error: 'An unexpected error occurred'
        }
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    if (req.method !== 'GET') {
        return res.status(405).json({success: false, error: 'Method not allowed'})
    }

    const blockNumber = req.query.blockNumber

    const data = await getBlock(blockNumber as string);
    if (!data.success) {
        const code = data.error === 'Block not found' ? 404 : 500
        return res.status(code).json({
            success: false,
            error: data.error
        })
    } else {
        return res.status(200).json(data)
    }
}
