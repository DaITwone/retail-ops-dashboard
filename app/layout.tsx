import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "./theme-provider";

import { Be_Vietnam_Pro } from "next/font/google";

const font = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "WinMart+ | Retail Ops Dashboard",
  description: "Hệ thống quản lý vận hành cửa hàng",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi" 
      suppressHydrationWarning
      className={font.className}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
