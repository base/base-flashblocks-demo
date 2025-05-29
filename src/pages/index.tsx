import { BlockExplorer } from "@/components/block-explorer";
import { createConfig, http, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { baseSepolia } from "viem/chains";
import { useState } from "react";
import { useFlashblocks } from "@/hooks/useFlashblocks";

const config = createConfig({
    chains: [baseSepolia],
    transports: {
        [baseSepolia.id]: http(),
    },
})

const queryClient = new QueryClient()

export default function Home() {
    const [selectedNetwork, setSelectedNetwork] = useState('sepolia');
    const { blocks, pendingBlock } = useFlashblocks(selectedNetwork);

    return (
        <div>
            <WagmiProvider config={config}>
                <QueryClientProvider client={queryClient}>
                    <BlockExplorer />
                </QueryClientProvider>
            </WagmiProvider>
        </div>
    );
}
