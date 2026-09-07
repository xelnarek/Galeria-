import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#0B0B0B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  userScalable: true,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Prywatna Galeria Obrazów',
  description: 'Cyfrowa wystawa sztuki i prywatna kolekcja obrazów stworzona jako wyjątkowy prezent.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Galeria',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Prywatna Galeria Obrazów',
    description: 'Cyfrowa wystawa sztuki i prywatna kolekcja obrazów stworzona jako wyjątkowy prezent.',
    type: 'website',
    locale: 'pl_PL',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1200&auto=format&fit=crop',
        width: 1200,
        height: 630,
        alt: 'Prywatna Galeria Obrazów',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prywatna Galeria Obrazów',
    description: 'Cyfrowa wystawa sztuki i prywatna kolekcja obrazów stworzona jako wyjątkowy prezent.',
    images: ['https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1200&auto=format&fit=crop'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" className="dark">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Galeria" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Galeria" />
      </head>
      <body className="bg-[#0B0B0B] text-[#F2F0EA] min-h-screen antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
