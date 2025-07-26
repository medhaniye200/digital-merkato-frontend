// app/layout.tsx
import type { Metadata } from 'next'
import { ReactNode } from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Digital Merkato Technology PLC',
    template: '%s | Digital Merkato'
  },
  description: 'Your technology solutions partner',
  metadataBase: new URL('https://www.digitalmerkato.com'),
  openGraph: {
    title: 'Digital Merkato Technology PLC',
    description: 'Your technology solutions partner',
    url: 'https://www.digitalmerkato.com',
    siteName: 'Digital Merkato',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
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
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  themeColor: '#ffffff',
}

// Load fonts with next/font
import { Poppins } from 'next/font/google'

const poppins = Poppins({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
})

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${poppins.variable}`}>
      <head>
        {/* Font Awesome with integrity check */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
          integrity="sha512-ZtQxJINrRWxGzCn2fLJd0VPb4us5U+6RGGLqfVhAGH8ZRpq2+z7TxzFGfTKNvZlGv2Xpqx4eLb9uxytY30hvTg=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />

        {/* Responsive viewport - recommended way for Next.js */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />

        {/* Favicon links */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen antialiased font-sans">
        {children}
      </body>
    </html>
  )
}