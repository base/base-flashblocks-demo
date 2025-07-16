import {sortByHighlighted, SubBlock, truncateHash} from "@/utils/block-utils";
import {Card} from "@/components/ui/card";
import {ChevronRight} from "lucide-react";

interface SubBlockCardProps {
    blockId: number;
    subBlock: SubBlock;
    isPending: boolean;
    highlightTransactions: Record<string, boolean>;
}

export function SubBlockCard({blockId, subBlock, isPending, highlightTransactions}: SubBlockCardProps) {
    const transactions = sortByHighlighted(subBlock.transactions, highlightTransactions);

    return (
        <Card className={`bg-white border-gray-200 shadow-sm ${isPending ? "border-l-blue-600" : ""}`}>
            <div className="p-4 pt-5">
                <div className="flex justify-between items-center mb-2">
                    <div className="text-black font-bold">
                        Block {blockId}#{subBlock.blockNumber}
                    </div>
                    <div className="text-xs text-gray-600">{isPending ? "Confirmed" : ""}</div>
                </div>
                <div className="text-xs space-y-3 pt-2">
                    {transactions.slice(0, 5).map((tx, index) => (
                        <div
                            key={index}
                            className={`flex justify-between items-center text-xs ${
                                highlightTransactions[tx.hash] ? "text-red-600" : "text-gray-700"
                            } hover:text-gray-900`}>
                            <div className="flex items-center gap-1">
                                <span>{truncateHash(tx.from)}</span>
                                {tx.to && (
                                    <>
                                        <ChevronRight className="w-3 h-3 text-gray-400" />
                                        <span>{truncateHash(tx.to)}</span>
                                    </>
                                )}
                            </div>
                            <div className="text-gray-600">({(Number(tx.value) / 1e18).toFixed(4)} ETH)</div>
                        </div>
                    ))}
                    {transactions.length > 5 && <div className="text-center text-gray-600">+ {transactions.length - 5} more transactions</div>}
                </div>
            </div>
        </Card>
    );
}
