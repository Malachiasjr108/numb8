
import type { Metadata } from 'next'
import './globals.css'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'Numb8 – Cosmic NFT Experience | 108 Studio Art',
  description: 'Enter The Portal. Discover Echoes, Circle, Infinite and ascend to Oracle in the Numb8 cosmic NFT journey.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script src="https://unpkg.com/lucide@latest" strategy="afterInteractive" />
        <Script id="lucide-init" strategy="afterInteractive">
          {`if (typeof lucide !== 'undefined') { lucide.createIcons(); }`}
        </Script>
      </body>
    </html>
  )
}
