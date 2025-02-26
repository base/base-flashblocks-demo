import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["600"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
