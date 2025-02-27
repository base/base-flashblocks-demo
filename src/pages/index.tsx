import {BlockExplorer} from "@/components/block-explorer";
import {defineChain} from "viem";
import {createConfig, http, WagmiProvider} from "wagmi";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {baseSepolia} from "viem/chains";



if (!process.env.NEXT_PUBLIC_BASE_RPC_URL) {
    throw new Error('NEXT_PUBLIC_BASE_RPC_URL env var is required');
}

export const sepoliaAlpha = defineChain({
    id: 11763072,
    name: 'Base Sepolia Alpha',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
        default: { http: [process.env.NEXT_PUBLIC_BASE_RPC_URL] },
    },
});


const config = createConfig({
    chains: [sepoliaAlpha, baseSepolia],
    transports: {
        [sepoliaAlpha.id]: http(),
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
