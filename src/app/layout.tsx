import "@/styles/globals.css";
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Base Flashblocks',
  description: 'Visualize Base Flashblocks',
  keywords: [
    'Base',
    'blockchain',
    'explorer',
    'Ethereum',
    'L2',
    'Coinbase',
    'flashblocks',
    'real-time',
    'blocks',
    'transactions',
    'decentralized',
    'crypto',
    'web3'
  ],
  authors: [{ name: 'Base', url: 'https://base.org' }],
  creator: 'Base',
  publisher: 'Base',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://flashblocks-demo.base.org',
    siteName: 'Base Flashblocks',
    title: 'Base Flashblocks',
    description: 'Visualize Base Flashblocks',
    images: [
      {
        url: '/Base_Logo.svg',
        width: 800,
        height: 600,
        alt: 'Base Logo',
        type: 'image/svg+xml',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@base',
    creator: '@base',
    title: 'Base Flashblocks',
    description: 'Visualize Base Flashblocks',
    images: ['/Base_Logo.svg'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  category: 'technology',
  applicationName: 'Base Flashblocks',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://flashblocks-demo.base.org'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en-US',
      'en': '/en',
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
