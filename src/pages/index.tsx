import {BlockExplorer} from "@/components/block-explorer";
import {NetworkProvider} from "@/contexts/network-context";

export default function Home() {
    return (
        <div>
            <NetworkProvider>
                <BlockExplorer />
            </NetworkProvider>
        </div>
    );
}
