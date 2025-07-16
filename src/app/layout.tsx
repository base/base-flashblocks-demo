import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Base - A global economy, built by all of us',
  description: 'Base is a decentralized, permissionless, and open-source blockchain built on Ethereum.',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
