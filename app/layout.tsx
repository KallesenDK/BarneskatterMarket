import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geist = localFont({
  src: [
    {
      path: '../public/fonts/Geist-Thin.ttf',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../public/fonts/Geist-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/fonts/Geist-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Geist-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/Geist-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/Geist-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/fonts/Geist-Black.ttf',
      weight: '900',
      style: 'normal',
    },
    {
      path: '../public/fonts/Geist-ExtraBold.ttf',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../public/fonts/Geist-ExtraLight.ttf',
      weight: '200',
      style: 'normal',
    }
  ],
  variable: '--font-geist',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "BarneSkatteMarket",
  description: "Køb og sælg brugt børnetøj og legetøj",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="da" className={geist.variable}>
      <body>{children}</body>
    </html>
  );
} 