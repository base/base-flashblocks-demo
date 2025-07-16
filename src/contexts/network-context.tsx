"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createConfig, http, WagmiProvider } from "wagmi";
import { baseSepolia, base } from "viem/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export type Network = 'mainnet' | 'sepolia';

interface NetworkContextType {
  selectedNetwork: Network;
  setSelectedNetwork: (network: Network) => void;
  websocketUrl: string;
  wagmiConfig: ReturnType<typeof createConfig>;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
}

const queryClient = new QueryClient();

const networkConfigs = {
  mainnet: {
    chain: base,
    websocketUrl: process.env.NEXT_PUBLIC_MAINNET_WEBSOCKET_URL!,
  },
  sepolia: {
    chain: baseSepolia,
    websocketUrl: process.env.NEXT_PUBLIC_SEPOLIA_WEBSOCKET_URL!,
  },
};

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [selectedNetwork, setSelectedNetwork] = useState<Network>('sepolia');
  
  const currentConfig = networkConfigs[selectedNetwork];
  
  const wagmiConfig = createConfig({
    chains: [currentConfig.chain],
    transports: {
      [currentConfig.chain.id]: http(),
    },
  });

  const contextValue: NetworkContextType = {
    selectedNetwork,
    setSelectedNetwork,
    websocketUrl: currentConfig.websocketUrl,
    wagmiConfig,
  };

  return (
    <NetworkContext.Provider value={contextValue}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </NetworkContext.Provider>
  );
}