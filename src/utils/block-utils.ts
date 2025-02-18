import type {Address} from "viem"

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

export function generateAddress(): Address {
  return `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}` as Address
}

export function truncateHash(hash: string): string {
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`
}

export function generateTransaction(): Transaction {
  return {
    hash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
    from: generateAddress(),
    to: generateAddress(),
    value: BigInt(Math.floor(Math.random() * 10 * 1e18)).toString(),
  }
}

export function addSubBlock(block: Block): Block {
  const subBlock = {
    blockNumber: block.subBlocks.length + 1,
    transactions: [generateTransaction(), generateTransaction()],
  }

  return {
    ...block,
    subBlocks: [...block.subBlocks, subBlock],
  }
}

export function generateCurrentBlock() {
  const block = {
    blockNumber: 1,
    timestamp: Date.now() / 1000,
    transactions: [],
    subBlocks: [],
  }

  return block;
}

export function generatePendingBlock(prevBlock: Block): Block {
  const block = {
    blockNumber: prevBlock.blockNumber + 1,
    timestamp: prevBlock.timestamp + 2,
    transactions: [],
    subBlocks: [],
  }

  return addSubBlock(block)
}

export function getRelativeTime(timestamp: number) {
  const seconds = Math.floor(Date.now() / 1000 - Number(timestamp))
  return `${seconds}s ago`
}

