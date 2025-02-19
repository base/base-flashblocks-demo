import {Block, getRelativeTime, transactionsFor, truncateHash} from "@/utils/block-utils";
import {Card} from "@/components/ui/card";
import {ChevronRight} from "lucide-react";

export function BlockCard({block, isNew}: { block: Block, isNew: boolean }) {
    const transactions = transactionsFor(block);

    if (isNew) {
    } else {
    }

    return <Card
        key={block.blockNumber}
        className={`bg-[#1A1A1A] border-[#2A2A2A] hover:border-[#0052FF]/50} ${isNew ? 'highlight' : ''}`}>
        <div className="p-4">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                    <div className="text-white">Block #{block.blockNumber}</div>
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                </div>
                <div className="text-sm text-gray-500">{getRelativeTime(block.timestamp)}</div>
            </div>
            <div className="space-y-2 text-xs">
                {transactions.slice(0, 5).map((tx, index) => (
                    <div key={index} className="flex justify-between items-center text-gray-400 hover:text-gray-300">
                        <div className="flex items-center gap-2">
                            <span>{truncateHash(tx.from)}</span>
                            {tx.to && <>
                                <ChevronRight className="w-3 h-3 text-gray-600" />
                                <span>{truncateHash(tx.to)}</span>
                            </>}
                        </div>
                        <div className="text-grey-600">({(Number(tx.value) / 1e18).toFixed(4)} ETH)</div>
                    </div>
                ))}
                {transactions.length > 5 && (
                    <div className="text-center text-gray-500">+ {transactions.length - 5} more transactions</div>
                )}
            </div>
        </div>
    </Card>

}