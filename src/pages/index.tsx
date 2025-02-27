import {BlockExplorer} from "@/components/block-explorer";
import {createConfig, http, WagmiProvider} from "wagmi";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {baseSepolia} from "viem/chains";

const config = createConfig({
    chains: [baseSepolia],
    transports: {
        [baseSepolia.id]: http(),
    },
})

const queryClient = new QueryClient()

export default function Home() {
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
