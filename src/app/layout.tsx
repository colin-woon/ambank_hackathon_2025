import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin"
import { extractRouterConfig } from "uploadthing/server"
import { ourFileRouter } from "@/app/api/uploadthing/core"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AmDash",
  description: "Smart centralized platform for data quality issue tracking",
  icons: {
    icon: "/amdash-logo-only.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        {children}
        <Toaster />
      </body>
    </html>
  )
}
