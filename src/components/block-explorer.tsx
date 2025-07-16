"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { NormalBlockList } from "./normal-block-list";
import { FlashBlockList } from "./flash-block-list";
import { useFlashblocks } from "@/hooks/useFlashblocks";
import { injected, useAccount, useConnect, useDisconnect, useSendTransaction } from "wagmi";
import { parseEther } from "viem";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/header";
import { useSwitchChain } from 'wagmi'
import { baseSepolia, base } from "viem/chains";
import { useNetwork } from "@/contexts/network-context";
import { NetworkSelector } from "@/components/network-selector";

function SendTransaction({ highlightTransactions }: { highlightTransactions: (txn: string) => void }) {
    const { switchChain } = useSwitchChain()
    const { chainId } = useAccount();
    const { selectedNetwork } = useNetwork();
    const { isPending, sendTransaction } = useSendTransaction();

    const targetChain = selectedNetwork === 'mainnet' ? base : baseSepolia;

    if (isPending || !chainId) {
        return <div>...</div>;
    }

    if (chainId !== targetChain.id) {
        return (
            <button
                disabled={!sendTransaction}
                onClick={() => {
                    switchChain({ chainId: targetChain.id })
                }}
                className="bg-gray-100 text-black py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors border border-gray-200">
                Switch Network
            </button>
        );
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
            className="bg-baseblue py-2 px-4 rounded-lg font-semibold text-white hover:bg-blue-700 transition-colors shadow-md">
            Send Transaction
        </button>
    );
}

function AccountButton() {
    const { isConnected } = useAccount()
    const { connect } = useConnect()
    const { disconnect } = useDisconnect()

    if (isConnected) {
        return <button className="bg-gray-100 text-black py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors border border-gray-200" onClick={() => disconnect()}>Disconnect</button>
    } else {
        return <button className="bg-baseblue py-2 px-4 rounded-lg font-medium text-white hover:bg-blue-700 border border-transparent transition-colors" onClick={() => connect({ connector: injected() })}>Connect</button>
    }
}

export function BlockExplorer() {
    const account = useAccount();
    const [flashMode, setFlashMode] = useState(true);
    const { selectedNetwork, setSelectedNetwork, websocketUrl } = useNetwork();
    const { blocks, pendingBlock } = useFlashblocks(websocketUrl);
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

    const sendTransactionButton = () => {
        if (account.isConnected) {
            return (
                <SendTransaction
                    highlightTransactions={txn => {
                        setTxns(txns => {
                            if (txns[txn]) {
                                return txns;
                            }
                            return { ...txns, [txn]: true };
                        });
                    }}
                />
            );
        }
    };

    return (
        <div className="min-h-screen bg-white text-black">
            <Header>
                <Link href="/docs" className="bg-gray-100 text-black py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors border border-gray-200">
                    Start Building
                </Link>
                <AccountButton />
                {sendTransactionButton()}
                <div className="h-6 w-px bg-gray-200"></div>
                <div className="flex items-center gap-2 bg-gray-100 px-2 py-2 rounded-lg border border-gray-200">
                    <Switch
                        id="flash-mode"
                        checked={flashMode}
                        onCheckedChange={setFlashMode}
                        className="data-[state=checked]:bg-baseblue"
                    />
                    <Label htmlFor="flash-mode" className="text-sm cursor-pointer select-none text-black">
                        <Image src="/flashblocks.svg" alt="Flashblocks Logo" width={22} height={22} />
                    </Label>
                </div>
                <NetworkSelector
                    selectedNetwork={selectedNetwork}
                    onNetworkChange={setSelectedNetwork}
                />
            </Header>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {blockList()}
            </div>
        </div>
    );
}
