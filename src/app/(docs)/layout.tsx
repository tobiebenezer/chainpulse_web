import type { Metadata } from 'next';
import { Outfit, JetBrains_Mono } from 'next/font/google';
import '../globals.css';
import Providers from '../providers';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ChainPulse Docs | Developer Reference Portal',
  description: 'Multi-tenant real-time blockchain monitoring and webhook failover API reference.',
};

export default function DocsRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${jetbrainsMono.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style={{ backgroundColor: '#060709', margin: 0, padding: 0 }}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
