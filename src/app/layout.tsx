import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/ThemeProvider';
import { Lato } from 'next/font/google';

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-lato',
});


export const metadata: Metadata = {
  title: 'Strawberry Wallet',
  description: 'Your private wallet on Telegram',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="icon" href="/strawberry-logo.svg" type="image/svg+xml" />
      </head>
      <body className={`${lato.variable} font-body antialiased bg-background`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          themes={['light', 'dark', 'dim']}
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
