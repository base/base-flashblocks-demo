"use client";

import {useState} from "react";
import {Switch} from "@/components/ui/switch";
import {Label} from "@/components/ui/label";
import {NormalBlockList} from "./normal-block-list";
import {FlashBlockList} from "./flash-block-list";
import {useFlashblocks} from "@/hooks/useFlashblocks";
import {injected, useAccount, useConnect, useDisconnect, useSendTransaction} from "wagmi";
import {parseEther} from "viem";
import Link from "next/link";
import Image from "next/image";

function SendTransaction({highlightTransactions}: {highlightTransactions: (txn: string) => void}) {
    const {isPending, sendTransaction} = useSendTransaction();

    if (isPending) {
        return <div>...</div>;
    }

    return (
            <button
                disabled={!sendTransaction}
                onClick={() => {
                    sendTransaction(
                        {
                            to: "0x557BB85Fc501616668D39d82AaA9B25027e9e296",
                            value: parseEther("0.0001"),
                        },
                        {
                            onSuccess: hash => {
                                highlightTransactions(hash);
                            },
                        }
                    );
                }}
                className="bg-[#0052FF] py-2 px-4 rounded-full font-semibold">
                Send Transaction
            </button>
    );
}

function AccountButton() {
    const {isConnected } = useAccount()
    const { connect} = useConnect()
    const { disconnect } = useDisconnect()

    if (isConnected) {
        return <button className="bg-[#1A1A1A] py-2 px-4 rounded-full font-semibold" onClick={() => disconnect()}>Disconnect</button>
    } else {
        return <button className="bg-[#0052FF] py-2 px-4 rounded-full font-semibold" onClick={() => connect({ connector: injected() })}>Connect</button>
    }
}

export function BlockExplorer() {
    const account = useAccount();
    const [flashMode, setFlashMode] = useState(false);
    const {blocks, pendingBlock} = useFlashblocks();
    const [txns, setTxns] = useState<Record<string, boolean>>({});

    const blockList = () => {
            return (
                <div className={`grid ${flashMode ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"} gap-6`}>
                    <div>
                        <h1 className="text-xl font-bold">Blocks</h1>
                        <NormalBlockList blocks={blocks} highlightTransactions={txns} />
                    </div>
                    {flashMode && <div>
                        <h1 className="text-xl font-bold">Flashblocks</h1>
                        <FlashBlockList blocks={blocks} pendingBlock={pendingBlock} showFlashBlocks={true} highlightTransactions={txns} />
                    </div>}
                </div>
            );
    };

    const menuButton = () => {
        if (account.isConnected) {
            return (
                <SendTransaction
                    highlightTransactions={txn => {
                        setTxns(txns => {
                            if (txns[txn]) {
                                return txns;
                            }
                            return {...txns, [txn]: true};
                        });
                    }}
                />
            );
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white">
            <nav className="border-b border-[#1A1A1A] bg-[#0A0A0A]/90 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <img src="/Base_Wordmark_White.svg" alt="Base" className="h-6" />
                        <Link href="/docs" className="text-xl font-bold hover:text-[#0052FF] transition-colors">
                            docs
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        {menuButton()}
                        <AccountButton />
                        <div className="flex items-center gap-3 bg-[#1A1A1A] px-2 py-2 rounded-full">
                            <Switch
                                id="flash-mode"
                                checked={flashMode}
                                onCheckedChange={setFlashMode}
                                className="data-[state=checked]:bg-[#0052FF]"
                            />
                            <Label htmlFor="flash-mode" className="text-sm cursor-pointer select-none">
                                <Image src="/flashblocks.svg" alt="Flashblocks Logo" width={25} height={25} />
                            </Label>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {blockList()}
            </div>
        </div>
    );
}
