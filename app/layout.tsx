import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { Music } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">

      <body> <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <Music className="h-6 w-6 mr-2" />
              <h2 className="text-xl font-bold">ChordKeeper</h2>
            </Link>

          </div>
        </div>
      </header>{children}</body>
      <Toaster />
    </html>
  )
}
