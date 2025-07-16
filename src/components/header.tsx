import Link from "next/link";
import Image from "next/image";
import React from "react";

export function Header({children}: {children: React.ReactNode}) {
    return <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center">
                <Link href="/">
                    <Image src="/Base_Logo.svg" alt="Base" width={120} height={30} />
                </Link>
            </div>
            <div className="flex items-center gap-4">
                {children}
            </div>
        </div>
    </nav>
}