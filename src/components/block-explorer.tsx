"use client"

import {useState} from "react"
import {Terminal} from "lucide-react"
import {Switch} from "@/components/ui/switch"
import {Label} from "@/components/ui/label"
import {NormalBlockList} from "./normal-block-list"
import {FlashBlockList} from "./flash-block-list"
import {useFlashblocks} from "@/hooks/useFlashblocks";
import {useAccount, useBalance, useDisconnect, useSendTransaction} from "wagmi";
import {WalletDefault} from "@coinbase/onchainkit/wallet";
import {parseEther} from "viem";

function SendTransaction({highlightTransactions}: {highlightTransactions: (txn: string) => void}) {
    const { isPending, sendTransaction } = useSendTransaction();
    const {disconnect} = useDisconnect();

    if (isPending) {
        return <div>...</div>
    }

    return (
        <>
            <button
                disabled={!sendTransaction}
                onClick={() => {
                    sendTransaction({
                        to: '0x557BB85Fc501616668D39d82AaA9B25027e9e296',
                        value: parseEther('0.0001'),
                    }, {
                        onSuccess: (hash) => {
                            console.log('onSuccess', hash);
                            highlightTransactions(hash);
                        }
                    });
                }}
            >
                Send
            </button>
            <button
                onClick={() => {
                    disconnect();
                }}
            >
                Disconnect
            </button>
        </>
    )
}

export function BlockExplorer() {
    const account = useAccount();
    const balance = useBalance({
        address: account.address,
    });
    const [flashMode, setFlashMode] = useState(false)
    const {blocks, pendingBlock} = useFlashblocks();
    const [txns, setTxns] = useState<Record<string, boolean>>({});

    const blockList = () => {
        if (false) {
            return <div className={`grid "grid-cols-1 gap-6`}>
                <FlashBlockList blocks={blocks} pendingBlock={pendingBlock} showFlashBlocks={flashMode} highlightTransactions={txns} />
            </div>
        } else {
            return <div className={`grid ${flashMode ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"} gap-6`}>
                <NormalBlockList blocks={blocks} highlightTransactions={txns}/>
                {flashMode && <FlashBlockList blocks={blocks} pendingBlock={pendingBlock} showFlashBlocks={true} highlightTransactions={txns} />}
            </div>
        }
    }

    const menuButton = () => {
        if (account.isConnected) {
            return <SendTransaction highlightTransactions={(txn) => {
                setTxns(txns => {
                    if (txns[txn]) {
                        return txns;
                    }
                    return {...txns, [txn]: true,}
                })
            }} />

        } else {
            return <WalletDefault />
        }
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white font-mono">
            <nav className="border-b border-[#1A1A1A] bg-[#0A0A0A]/90 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="text-xl font-bold">base</div>
                    </div>
                    {balance.data?.formatted && <p>{balance.data?.formatted.slice(0, 5)} ETH</p>}
                    {menuButton()}
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Terminal className="w-5 h-5 text-[#0052FF]"/>
                        <h1 className="text-xl font-bold">Live Blocks</h1>
                    </div>
                    <div className="flex items-center gap-3 bg-[#1A1A1A] px-3 py-2 rounded-full">
                        <Switch
                            id="flash-mode"
                            checked={flashMode}
                            onCheckedChange={setFlashMode}
                            className="data-[state=checked]:bg-[#0052FF]"
                        />
                        <Label htmlFor="flash-mode" className="text-sm cursor-pointer select-none">
                            ⚡🤖
                        </Label>
                    </div>
                </div>
                {blockList()}
            </div>
        </div>
    )
}

