import {BlockExplorer} from "@/components/block-explorer";
import {Block} from "@/utils/block-utils";
import {getBlock} from "@/pages/api/blocks";

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
