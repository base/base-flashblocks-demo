"use client"

import {useEffect, useRef, useState} from "react"
import {Terminal} from "lucide-react"
import {Switch} from "@/components/ui/switch"
import {Label} from "@/components/ui/label"
import {NormalBlockList} from "./normal-block-list"
import {FlashBlockList} from "./flash-block-list"
import {addSubBlock, type Block, generatePendingBlock} from "@/utils/block-utils"

interface State {
    blocks: Block[]
    pendingBlock?: Block
    tick: number
}

export function BlockExplorer({startBlock}: { startBlock: Block }) {
    const [flashMode, setFlashMode] = useState(false)

    const [state, setState] = useState<State>({
        blocks: [startBlock],
        pendingBlock: generatePendingBlock(startBlock),
        tick: 0
    })

    const lastBlockNumber = useRef(startBlock.blockNumber);

    useEffect(() => {
        const subBlockInterval = setInterval(async () => {
            try {
                // Increment the block number we want to fetch
                const nextBlockNumber = lastBlockNumber.current + 1;

                const resp = await fetch(`/api/blocks?blockNumber=${nextBlockNumber}`)
                const json = await resp.json()
                if (json.success) {
                    const newBlock = json.data;
                    lastBlockNumber.current = nextBlockNumber;
                    setState(prevState => {
                        const blockCopy = [newBlock, ...prevState.blocks];
                        blockCopy.sort((a, b) => b.blockNumber - a.blockNumber);
                        return {
                            tick: prevState.tick + 1,
                            pendingBlock: generatePendingBlock(newBlock),
                            blocks: [...blockCopy].slice(0, 10)
                        }
                    })
                } else {
                    setState(prevState => {
                        return {
                            ...prevState,
                            pendingBlock: addSubBlock(prevState.pendingBlock!),
                            tick: prevState.tick + 1,
                        }
                    })
                }

            } catch (error) {
                console.error(error);
            }
        }, 200)

        return () => clearInterval(subBlockInterval);
    }, []) // Empty dependency array since we're using refs and state updater

    const {blocks, pendingBlock} = state;

    const blockList = () => {
        if (false) {
            return <div className={`grid "grid-cols-1 gap-6`}>
                <FlashBlockList blocks={blocks} pendingBlock={pendingBlock} showFlashBlocks={flashMode}/>
            </div>
        } else {
            return <div className={`grid ${flashMode ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"} gap-6`}>
                <NormalBlockList blocks={blocks}/>
                {flashMode && <FlashBlockList blocks={blocks} pendingBlock={pendingBlock} showFlashBlocks={true}/>}
            </div>
        }
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white font-mono">
            <nav className="border-b border-[#1A1A1A] bg-[#0A0A0A]/90 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="text-xl font-bold">base</div>
                    </div>
                    <button
                        className="bg-[#0052FF] text-white px-4 py-2 rounded-full text-sm hover:bg-[#0052FF]/90 transition">
                        Connect
                    </button>
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

