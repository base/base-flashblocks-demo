export interface SubBlock {
  blockNumber: number
  transactions: Transaction[]
  transactionHashes: string[]
}

export interface Transaction {
  hash: string
  from: string
  to: string
  value: bigint
}

export interface Block {
  blockNumber: number
  timestamp: number
  transactions: Transaction[]
  subBlocks: SubBlock[]
}

export function transactionsFor(block: Block): Transaction[] {
  return block.subBlocks.flatMap((subBlock) => subBlock.transactions)
}

export function getRelativeTime(timestamp: number) {
  const seconds = Math.floor(Date.now() / 1000 - Number(timestamp))
  return `${seconds}s ago`
}

export function truncateHash(hash: string): string {
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`
}
