import type { Metadata } from "next";
import { Geist, Geist_Mono, Caveat_Brush, Pacifico, Qwitcher_Grypen, Dancing_Script } from "next/font/google";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import '@ant-design/v5-patch-for-react-19';
import ConsoleFilter from '@/components/ConsoleFilter';
import { LanguageProvider } from '@/contexts/LanguageContext';
import AntdStyleProvider from '@/components/AntdStyleProvider';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
  fallback: ['system-ui', 'arial'],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  fallback: ['ui-monospace', 'SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', 'monospace'],
});

const caveatBrush = Caveat_Brush({
  variable: "--font-caveat-brush",
  subsets: ["latin"],
  weight: "400",
  display: 'swap',
  fallback: ['cursive'],
});

const pacifico = Pacifico({
  variable: "--font-pacifico",
  subsets: ["latin"],
  weight: "400",
  display: 'swap',
  fallback: ['cursive'],
});

const qwitcherGrypen = Qwitcher_Grypen({
  variable: "--font-qwitcher-grypen",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: 'swap',
  fallback: ['cursive'],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: 'swap',
  fallback: ['cursive'],
});

export const metadata: Metadata = {
  title: "resumeflex - Professional Portfolio",
  description: "Modern portfolio application built with Next.js",
};

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${caveatBrush.variable} ${pacifico.variable} ${qwitcherGrypen.variable} ${dancingScript.variable} antialiased`}
      >
        <ConsoleFilter />
        <LanguageProvider>
          <AntdStyleProvider>
            <AntdRegistry>{children}</AntdRegistry>
          </AntdStyleProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
