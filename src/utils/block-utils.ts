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
  subBlocks: SubBlock[]
}

export function sortByHighlighted(txns: Transaction[], highlight: Record<string, boolean>): Transaction[] {
  return txns.sort((a, b) => {
    const isAHighlighted = highlight[a.hash] || false;
    const isBHighlighted = highlight[b.hash] || false;

    if (isAHighlighted && !isBHighlighted) return -1;
    if (!isAHighlighted && isBHighlighted) return 1;
    return 0;
  });
}

export function transactionsFor(block: Block, highlight: Record<string, boolean>): Transaction[] {
  const transactions = block.subBlocks.flatMap((subBlock) => subBlock.transactions)
  return sortByHighlighted(transactions, highlight);
}

export function getRelativeTime(timestamp: number) {
  const seconds = Math.floor(Date.now() / 1000 - Number(timestamp))
  return `${seconds}s ago`
}

export function truncateHash(hash: string): string {
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`
}
