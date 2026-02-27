import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0a0a0a',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://archivoalsil.com'),
  title: {
    default: 'Archivo ALSIL — Análisis, opinión y cultura',
    template: '%s | Archivo ALSIL',
  },
  description: 'Blog de análisis, opinión y divulgación sobre ciencia, ingeniería, política, arte y cultura. Por Miguel Ángel Álvarez Silva.',
  keywords: ['blog', 'análisis', 'opinión', 'ciencia', 'ingeniería', 'política', 'arte', 'cultura', 'México', 'ALSIL'],
  authors: [{ name: 'Miguel Ángel Álvarez Silva' }],
  creator: 'Miguel Ángel Álvarez Silva',
  icons: { icon: '/uploads/logo.png' },
  alternates: {
    canonical: 'https://archivoalsil.com',
  },
  openGraph: {
    title: 'Archivo ALSIL',
    description: 'Análisis, opinión y divulgación sobre ciencia, ingeniería, política, arte y cultura.',
    url: 'https://archivoalsil.com',
    siteName: 'Archivo ALSIL',
    locale: 'es_MX',
    type: 'website',
    images: [{
      url: '/uploads/logo.png',
      width: 512,
      height: 512,
      alt: 'Archivo ALSIL',
    }],
  },
  twitter: {
    card: 'summary',
    title: 'Archivo ALSIL',
    description: 'Análisis, opinión y divulgación sobre ciencia, ingeniería, política, arte y cultura.',
    images: ['/uploads/logo.png'],
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Archivo ALSIL',
              url: 'https://archivoalsil.com',
              description: 'Blog de análisis, opinión y divulgación sobre ciencia, ingeniería, política, arte y cultura.',
              author: {
                '@type': 'Person',
                name: 'Miguel Ángel Álvarez Silva',
              },
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://archivoalsil.com/archivo?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased bg-zinc-950 text-zinc-100`}>
        {children}
      </body>
    </html>
  );
}
