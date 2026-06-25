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
  title: 'ChainPulse | High-Performance Blockchain Webhook Failover System',
  description: 'Multi-tenant real-time blockchain monitoring and webhook failover analytics dashboard.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${jetbrainsMono.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="cyber-app-body">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
