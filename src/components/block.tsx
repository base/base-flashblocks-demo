import {Block, getRelativeTime, transactionsFor, truncateHash} from "@/utils/block-utils";
import {Card} from "@/components/ui/card";
import {ChevronRight} from "lucide-react";

export function BlockCard({block, isNew, highlightTransactions}: {block: Block; isNew: boolean; highlightTransactions: Record<string, boolean>}) {
    const transactions = transactionsFor(block, highlightTransactions);

    return (
        <Card key={block.blockNumber} className={`bg-white border-gray-200 hover:border-blue-500/50 shadow-sm ${isNew ? "highlight" : ""}`}>
            <div className="p-4 pt-5">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                        <div className="text-black font-semibold">Block #{block.blockNumber}</div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="text-sm text-gray-600">{getRelativeTime(block.timestamp)}</div>
                </div>
                <div className="text-xs space-y-3 pt-2">
                    {transactions.slice(0, 5).map((tx, index) => (
                        <div
                            key={index}
                            className={`flex justify-between items-center text-xs ${
                                highlightTransactions[tx.hash] ? "text-red-600" : "text-gray-700"
                            } hover:text-gray-900`}>
                            <div className="flex items-center gap-2">
                                <span>{truncateHash(tx.from)}</span>
                                {tx.to && (
                                    <>
                                        <ChevronRight className="w-3 h-3 text-gray-400" />
                                        <span>{truncateHash(tx.to)}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                    {transactions.length > 5 && <div className="text-center text-gray-600">+ {transactions.length - 5} more transactions</div>}
                </div>
            </div>
        </Card>
    );
}
