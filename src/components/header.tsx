import Link from "next/link";
import Image from "next/image";
import React from "react";

export function Header({children}: {children: React.ReactNode}) {
    return <nav className="border-b border-[#1A1A1A] bg-[#0A0A0A]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/">
                <Image src="/Base_Wordmark_White.svg" alt="Base" width={100} height={30} />
            </Link>
            <div className="flex items-center gap-4">
                {children}
            </div>
        </div>
    </nav>
}