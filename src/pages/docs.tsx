import { GetServerSideProps } from 'next';

export default function Docs() {
    return null;
}

export const getServerSideProps: GetServerSideProps = async () => {
    return {
        redirect: {
            destination: 'https://docs.base.org/chain/flashblocks',
            permanent: true,
        },
    };
};