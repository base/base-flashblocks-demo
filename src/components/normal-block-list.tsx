import {type Block} from "@/utils/block-utils"
import {BlockCard} from "@/components/block";

interface NormalBlockListProps {
  blocks: Block[]
  highlightTransactions: Record<string, boolean>
}

export function NormalBlockList({ blocks, highlightTransactions }: NormalBlockListProps) {
  return (
    <div className="space-y-6 relative">
      <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-[#0052FF] to-transparent opacity-50" />
      {blocks.map((block, index) => {
          return <BlockCard block={block} key={index} isNew={index == 0} highlightTransactions={highlightTransactions} />
      })}
    </div>
  )
}

