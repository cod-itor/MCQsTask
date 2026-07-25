import type React from "react"
export const dynamic = "force-dynamic"

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <div className="min-h-screen bg-slate-950">
            {children}
        </div>
    )
}
