"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export type Network = 'mainnet' | 'sepolia';

interface NetworkSelectorProps {
  selectedNetwork: Network;
  onNetworkChange: (network: Network) => void;
}

const networks = [
  { id: 'mainnet' as Network, name: 'Base Mainnet', icon: '🔵' },
  { id: 'sepolia' as Network, name: 'Base Sepolia', icon: '🏗️' },
];

export function NetworkSelector({ selectedNetwork, onNetworkChange }: NetworkSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedNetworkInfo = networks.find(n => n.id === selectedNetwork);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#515151] hover:bg-[#616161] py-2 px-4 rounded-full font-semibold flex items-center gap-2"
      >
        <span>{selectedNetworkInfo?.icon}</span>
        <span>{selectedNetworkInfo?.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 right-0 bg-[#1A1A1A] border border-[#333] rounded-lg shadow-lg z-20 min-w-[160px]">
            {networks.map((network) => (
              <button
                key={network.id}
                onClick={() => {
                  onNetworkChange(network.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 hover:bg-[#2A2A2A] flex items-center gap-3 first:rounded-t-lg last:rounded-b-lg ${
                  selectedNetwork === network.id ? 'bg-[#0052FF]/20 text-[#0052FF]' : ''
                }`}
              >
                <span>{network.icon}</span>
                <span className="text-sm">{network.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}