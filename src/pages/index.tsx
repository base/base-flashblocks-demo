import {BlockExplorer} from "@/components/block-explorer";
import {NextPageContext} from "next";
import {Block} from "@/utils/block-utils";
import {getBlock} from "@/pages/api/blocks";

Home.getSer = async (ctx: NextPageContext) => {
    const res = await fetch('/api/blocks')
    const json = await res.json()
    return { startBlock: json.data }
}

export async function getServerSideProps() {
    const jsonData = await getBlock(undefined);
    if (!jsonData.success) {
        throw new Error(jsonData.error)
    }
    return {
        props: {
            startBlock: jsonData.data
        }
    }
}

export default function Home({ startBlock }: { startBlock: Block }) {
  return (
    <div>
        <BlockExplorer startBlock={startBlock} />
    </div>
  );
}
