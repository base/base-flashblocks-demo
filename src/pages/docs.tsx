import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { ChevronDown, ChevronUp, Copy } from "lucide-react";
import {Header} from "@/components/header";

export default function Docs() {
  const [showIndex0Response, setShowIndex0Response] = useState(false);
  const [showIndexNResponse, setShowIndexNResponse] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [showBlockResponse, setShowBlockResponse] = useState(false);
  const [showReceiptResponse, setShowReceiptResponse] = useState(false);
  const [showBalanceResponse, setShowBalanceResponse] = useState(false);

  const copyToClipboard = (text: string, commandId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(commandId);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Header>
        <Link href="/" className="bg-[#1A1A1A] py-2 px-4 rounded-full font-semibold">
          Explorer
        </Link>
      </Header>

      <div className="container mx-auto pr-8 pl-8 pt-4 pb-8">
        <div className="space-y-4">
          {/* Overview Section */}
          <Card className="bg-[#1A1A1A] border border-[#2A2A2A]">
            <CardHeader>
              <CardTitle className="text-white">Integrating Flashblocks</CardTitle>
              <CardDescription className="text-gray-400">
                Choose how you want to receive Flashblocks data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li>
                  <a
                      href="#websocket"
                      className="text-white hover:text-gray-400 transition-colors flex items-center gap-2"
                  >
                    WebSocket API
                    <span className="text-xs text-gray-400">→</span>
                  </a>
                </li>
                <li>
                  <a
                      href="#rpc"
                      className="text-white hover:text-gray-400 transition-colors flex items-center gap-2"
                  >
                    RPC API
                    <span className="text-xs text-gray-400">→</span>
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">


          {/* WebSocket API Section */}
          <Card
              id="websocket"
              className="bg-[#1A1A1A] border border-[#2A2A2A] scroll-mt-8"
          >
            <CardHeader>
              <CardTitle className="text-white">WebSocket API</CardTitle>
              <CardDescription className="text-gray-400">
                Stream realtime block updates over a WebSocket.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <p className="text-sm text-white">
                  Connect to:{" "}
                  <code className="bg-[#2A2A2A] px-2 py-1 rounded">
                    wss://sepolia.flashblocks.base.org/ws
                  </code>
                </p>

                <div className="space-y-2">
                  <h4 className="font-semibold text-white">Example Request:</h4>
                  <p className="text-sm text-gray-400 mb-2">
                    First install websocat:
                  </p>
                  <pre className="bg-[#2A2A2A] p-4 rounded-lg overflow-x-auto mb-4">
                    <code className="text-sm text-white">
                      brew install websocat # macOS
                    </code>
                  </pre>
                  <p className="text-sm text-gray-400 mb-2">OR</p>
                  <pre className="bg-[#2A2A2A] p-4 rounded-lg overflow-x-auto mb-4">
                    <code className="text-sm text-white">
                      sudo apt-get install websocat # Ubuntu/Debian
                    </code>
                  </pre>
                  <p className="text-sm text-gray-400 mb-2">Then connect:</p>
                  <pre className="bg-[#2A2A2A] p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm text-white">
                      websocat wss://sepolia.flashblocks.base.org/ws
                    </code>
                  </pre>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-white">
                    Example Response (index 0):
                  </h4>
                  <p className="text-sm text-gray-400 mb-2">
                    First payload includes base block data
                  </p>
                  <button
                      onClick={() => setShowIndex0Response(!showIndex0Response)}
                      className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-2"
                  >
                    {showIndex0Response ? (
                        <ChevronUp size={16}/>
                    ) : (
                        <ChevronDown size={16}/>
                    )}
                    {showIndex0Response ? "Hide Response" : "Show Response"}
                  </button>
                  {showIndex0Response && (
                      <pre className="bg-[#2A2A2A] p-4 rounded-lg overflow-x-auto">
                      <code className="text-sm text-white">{`{
  "payload_id": "0x03997352d799c31a",
  "index": 0,
  "base": {
    "parent_hash": "0x9edc29b8b0a1e31d28616e40c16132ad0d58faa8bb952595b557526bdb9a960a",
    "fee_recipient": "0x4200000000000000000000000000000000000011",
    "block_number": "0x158a0e9",
    "gas_limit": "0x3938700",
    "timestamp": "0x67bf8332",
    "base_fee_per_gas": "0xfa"
    // ... other base fields ...
  },
  "diff": {
    "state_root": "0x208fd63edc0681161105f27d03daf9f8c726d8c94e584a3c0696c98291c24333",
    "block_hash": "0x5c330e55a190f82ea486b61e5b12e27dfb4fb3cecfc5746886ef38ca1281bce8",
    "gas_used": "0xab3f",
    "transactions": [
      "0x7ef8f8a0b4afc0b7ce10e150801bbaf08ac33fecb0f38311793abccb022120d321c6d276..."
    ],
    "withdrawals": []
    // ... other diff fields ...
  },
  "metadata": {
    "block_number": 22585577,
    "new_account_balances": {
      "0x000f3df6d732807ef1319fb7b8bb8522d0beac02": "0x0",
      // ... other balances ...
    },
    "receipts": {
      "0x07d7f06b06fea714c1d1d446efa2790c6970aa74ee006186a32b5b7dd8ca2d82": {
        "Deposit": {
          "status": "0x1",
          "depositNonce": "0x158a0ea"
          // ... other receipt fields ...
        }
      }
    }
  }
}`}</code>
                    </pre>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-white">
                    Example Response (index &gt; 0):
                  </h4>
                  <p className="text-sm text-gray-400 mb-2">
                    Subsequent payloads only include diff data
                  </p>
                  <button
                      onClick={() => setShowIndexNResponse(!showIndexNResponse)}
                      className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-2"
                  >
                    {showIndexNResponse ? (
                        <ChevronUp size={16}/>
                    ) : (
                        <ChevronDown size={16}/>
                    )}
                    {showIndexNResponse ? "Hide Response" : "Show Response"}
                  </button>
                  {showIndexNResponse && (
                      <pre className="bg-[#2A2A2A] p-4 rounded-lg overflow-x-auto">
                      <code className="text-sm text-white">{`{
  "payload_id": "0x03e303378749418d",
  "index": 4,
  "diff": {
    "state_root": "0x7a8f45038665072f382730e689f4a1561835c9987fca8942fa95872fb9367eaa",
    "block_hash": "0x9b32f7a14cbd1efc8c2c5cad5eb718ec9e0c5da92c3ba7080f8d4c49d660c332",
    "gas_used": "0x1234f",
    "transactions": [
      "0x7ef8f8a0b4afc0b7ce10e150801bbaf08ac33fecb0f38311793abccb022120d321c6d276..."
    ],
    "withdrawals": []
    // ... other diff fields ...
  },
  "metadata": {
    "block_number": 22585577,
    "new_account_balances": {
      "0x000f3df6d732807ef1319fb7b8bb8522d0beac02": "0x0",
      "0x4200000000000000000000000000000000000015": "0x1234"
      // ... other balances ...
    },
    "receipts": {
      "0x07d7f06b06fea714c1d1d446efa2790c6970aa74ee006186a32b5b7dd8ca2d82": {
        "status": "0x1",
        "gasUsed": "0x1234f",
        "logs": []
        // ... other receipt fields ...
      }
    }
  }
}`}</code>
                    </pre>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* RPC API Section */}
          <Card
              id="rpc"
              className="bg-[#1A1A1A] border border-[#2A2A2A] scroll-mt-8"
          >
            <CardHeader>
              <CardTitle className="text-white">RPC API</CardTitle>
              <CardDescription className="text-gray-400">
                HTTP RPC endpoint for querying flashblock/preconf data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <p className="text-sm text-white">
                  Endpoint:{" "}
                  <code className="bg-[#2A2A2A] px-2 py-1 rounded">
                    sepolia-preconf.base.org
                  </code>
                </p>

                <div className="text-sm text-gray-400 p-4 bg-[#2A2A2A] rounded-lg">
                  <strong className="text-white">Note:</strong> In addition to
                  these flashblock-specific methods, all standard Ethereum
                  JSON-RPC methods are supported as usual.
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-white">
                    eth_getBlockByNumber
                  </h4>
                  <p className="text-sm text-gray-400">
                    Use the <code className="text-white">pending</code> tag
                  </p>
                  <div className="relative">
                    <pre className="bg-[#2A2A2A] p-4 rounded-lg overflow-x-auto">
                      <code className="text-sm text-white">{`curl https://sepolia-preconf.base.org \\
  -X POST \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_getBlockByNumber",
    "params": ["pending", true],
    "id": 1
  }'`}</code>
                    </pre>
                    <button
                        onClick={() =>
                            copyToClipboard(
                                `curl https://sepolia-preconf.base.org -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_getBlockByNumber","params":["pending",true],"id":1}'`,
                                "getBlock"
                            )
                        }
                        className="absolute top-3 right-3 p-2 hover:bg-[#3A3A3A] rounded transition-colors"
                    >
                      {copiedCommand === "getBlock" ? (
                          <span className="text-green-500 text-sm">Copied!</span>
                      ) : (
                          <Copy size={16} className="text-gray-400"/>
                      )}
                    </button>
                  </div>
                  <button
                      onClick={() => setShowBlockResponse(!showBlockResponse)}
                      className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mt-2"
                  >
                    {showBlockResponse ? (
                        <ChevronUp size={16}/>
                    ) : (
                        <ChevronDown size={16}/>
                    )}
                    {showBlockResponse ? "Hide Response" : "Show Response"}
                  </button>
                  {showBlockResponse && (
                      <pre className="bg-[#2A2A2A] p-4 rounded-lg overflow-x-auto">
                      <code className="text-sm text-white">{`{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "number": "0x1234",
    "hash": "0x...",
    "transactions": [...]
  }
}`}</code>
                    </pre>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-white">
                    eth_getTransactionReceipt
                  </h4>
                  <div className="relative">
                    <pre className="bg-[#2A2A2A] p-4 rounded-lg overflow-x-auto">
                      <code className="text-sm text-white">{`curl https://sepolia-preconf.base.org \\
  -X POST \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_getTransactionReceipt",
    "params": ["0x..."],
    "id": 1
  }'`}</code>
                    </pre>
                    <button
                        onClick={() =>
                            copyToClipboard(
                                `curl https://sepolia-preconf.base.org -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_getTransactionReceipt","params":["0x..."],"id":1}'`,
                                "getReceipt"
                            )
                        }
                        className="absolute top-3 right-3 p-2 hover:bg-[#3A3A3A] rounded transition-colors"
                    >
                      {copiedCommand === "getReceipt" ? (
                          <span className="text-green-500 text-sm">Copied!</span>
                      ) : (
                          <Copy size={16} className="text-gray-400"/>
                      )}
                    </button>
                  </div>
                  <button
                      onClick={() => setShowReceiptResponse(!showReceiptResponse)}
                      className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mt-2"
                  >
                    {showReceiptResponse ? (
                        <ChevronUp size={16}/>
                    ) : (
                        <ChevronDown size={16}/>
                    )}
                    {showReceiptResponse ? "Hide Response" : "Show Response"}
                  </button>
                  {showReceiptResponse && (
                      <pre className="bg-[#2A2A2A] p-4 rounded-lg overflow-x-auto">
                      <code className="text-sm text-white">{`{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "transactionHash": "0x...",
    "blockNumber": "0x1234",
    "status": "0x1"
  }
}`}</code>
                    </pre>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-white">eth_getBalance</h4>
                  <p className="text-sm text-gray-400">
                    Use the <code className="text-white">pending</code> tag
                  </p>
                  <div className="relative">
                    <pre className="bg-[#2A2A2A] p-4 rounded-lg overflow-x-auto">
                      <code className="text-sm text-white">{`curl https://sepolia-preconf.base.org \\
  -X POST \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_getBalance",
    "params": ["0x...", "pending"],
    "id": 1
  }'`}</code>
                    </pre>
                    <button
                        onClick={() =>
                            copyToClipboard(
                                `curl https://sepolia-preconf.base.org -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0x...","pending"],"id":1}'`,
                                "getBalance"
                            )
                        }
                        className="absolute top-3 right-3 p-2 hover:bg-[#3A3A3A] rounded transition-colors"
                    >
                      {copiedCommand === "getBalance" ? (
                          <span className="text-green-500 text-sm">Copied!</span>
                      ) : (
                          <Copy size={16} className="text-gray-400"/>
                      )}
                    </button>
                  </div>
                  <button
                      onClick={() => setShowBalanceResponse(!showBalanceResponse)}
                      className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mt-2"
                  >
                    {showBalanceResponse ? (
                        <ChevronUp size={16}/>
                    ) : (
                        <ChevronDown size={16}/>
                    )}
                    {showBalanceResponse ? "Hide Response" : "Show Response"}
                  </button>
                  {showBalanceResponse && (
                      <pre className="bg-[#2A2A2A] p-4 rounded-lg overflow-x-auto">
                      <code className="text-sm text-white">{`{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x0234"
}`}</code>
                    </pre>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
}
