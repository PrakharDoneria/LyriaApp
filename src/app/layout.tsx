import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lyria | AI Music Generation",
  description: "Generate high-quality AI music from text prompts, lyrics, or images with Lyria.",
};

import { QuotaProvider } from "@/components/QuotaContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎵</text></svg>" />
      </head>
      <body>
        <QuotaProvider>
          {children}
        </QuotaProvider>
      </body>
    </html>
  );
}
