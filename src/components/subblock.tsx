import {SubBlock, truncateHash} from "@/utils/block-utils";
import {Card} from "@/components/ui/card";
import {ChevronRight} from "lucide-react";

interface SubBlockCardProps {
    blockId: number
    subBlock: SubBlock
    isPending: boolean
    highlightTransactions: Record<string, boolean>
}

/*
      className={`px-4 py-2 rounded ${
        isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
      }`}

 */

export function SubBlockCard({ blockId, subBlock, isPending, highlightTransactions }: SubBlockCardProps) {
    return (
        <Card
            className={`bg-[#1A1A1A] border-[#2A2A2A] ${isPending ? "border-l-[#0052FF]" : ""}`}
        >
            <div className="p-3">
                <div className="flex justify-between items-center mb-2">
                    <div className="text-white text-sm">
                        Block {blockId}#{subBlock.blockNumber}
                    </div>
                    <div className="text-xs text-gray-500">{isPending ? "Confirmed" : ""}</div>
                </div>
                <div className="space-y-1">
                    {subBlock.transactions.map((tx, index) => (
                        <div key={index} className={`flex justify-between items-center text-xs ${highlightTransactions[tx.hash] ? "text-red-400" : "text-gray-300"} hover:text-gray-200`}>
                            <div className="flex items-center gap-1">
                                <span>{truncateHash(tx.from)}</span>
                                {tx.to && <>
                                    <ChevronRight className="w-3 h-3 text-gray-600" />
                                    <span>{truncateHash(tx.to)}</span>
                                </>}
                            </div>
                            <div className="text-grey-600">({(Number(tx.value) / 1e18).toFixed(4)} ETH)</div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    )
}

