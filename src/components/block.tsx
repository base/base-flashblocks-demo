import {Block, getRelativeTime, transactionsFor, truncateHash} from "@/utils/block-utils";
import {Card} from "@/components/ui/card";
import {ChevronRight} from "lucide-react";

export function BlockCard({block, isNew, highlightTransactions}: {block: Block; isNew: boolean; highlightTransactions: Record<string, boolean>}) {
    const transactions = transactionsFor(block, highlightTransactions);

    return (
        <Card key={block.blockNumber} className={`bg-[#1A1A1A] border-[#2A2A2A] hover:border-[#0052FF]/50} ${isNew ? "highlight" : ""}`}>
            <div className="p-4 pt-5">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                        <div className="text-white font-semibold">Block #{block.blockNumber}</div>
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="text-sm text-gray-500">{getRelativeTime(block.timestamp)}</div>
                </div>
                <div className="text-xs space-y-3 pt-2">
                    {transactions.slice(0, 5).map((tx, index) => (
                        <div
                            key={index}
                            className={`flex justify-between items-center text-xs ${
                                highlightTransactions[tx.hash] ? "text-red-400" : "text-gray-300"
                            } hover:text-gray-200`}>
                            <div className="flex items-center gap-2">
                                <span>{truncateHash(tx.from)}</span>
                                {tx.to && (
                                    <>
                                        <ChevronRight className="w-3 h-3 text-gray-600" />
                                        <span>{truncateHash(tx.to)}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                    {transactions.length > 5 && <div className="text-center text-gray-500">+ {transactions.length - 5} more transactions</div>}
                </div>
            </div>
        </Card>
    );
}
