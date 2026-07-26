import type React from "react"
import { DarkModeProvider } from "@/lib/dark-mode-context"

export const dynamic = "force-dynamic"

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <DarkModeProvider>
            <div className="min-h-screen bg-slate-950 transition-colors duration-300">
                {children}
            </div>
        </DarkModeProvider>
    )
}
