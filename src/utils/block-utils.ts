export interface SubBlock {
  blockNumber: number
  transactions: Transaction[]
}

export interface Transaction {
  hash: string
  from: string
  to: string
  value: string
}

export interface Block {
  blockNumber: number
  timestamp: number
  transactions: Transaction[]
  subBlocks: SubBlock[]
}

export function transactionsFor(block: Block): Transaction[] {
  if (block.subBlocks.length > 0) {
    return block.subBlocks.flatMap((subBlock) => subBlock.transactions)
  }
  return block.transactions
}


export function truncateHash(hash: string): string {
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`
}

export function getRelativeTime(timestamp: number) {
  const seconds = Math.floor(Date.now() / 1000 - Number(timestamp))
  return `${seconds}s ago`
}

