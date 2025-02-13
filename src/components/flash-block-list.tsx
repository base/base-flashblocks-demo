import {BlockCard} from "@/components/block"
import {type Block} from "@/utils/block-utils"
import {SubBlockCard} from "@/components/subblock";

interface FlashBlockListProps {
  blocks: Block[]
  pendingBlock?: Block
  showFlashBlocks: boolean
}

export function FlashBlockList({ blocks, pendingBlock, showFlashBlocks }: FlashBlockListProps) {
  return (
    <div className="space-y-6 relative">
      <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-[#0052FF] to-transparent opacity-50" />

      {showFlashBlocks && pendingBlock && (
        <div className="space-y-2">
          {pendingBlock.subBlocks.map((sb, index) => (
              <SubBlockCard
                key={index}
                blockId={Number(pendingBlock.blockNumber)}
                subBlock={sb}
                isPending={true}
              />
            ))
            .reverse()}
        </div>
      )}

      {blocks.map((block, idx) => (
          <BlockCard block={block} key={block.blockNumber} isNew={!showFlashBlocks && idx == 0} />
      ))}
    </div>
  )
}
