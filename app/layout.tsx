import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Arogya Marg — Right Care. Right Place. Right Time.",
  description:
    "An integrated care coordination platform connecting patients, frontline workers, clinicians and public-health facilities across the rural healthcare journey.",
  keywords: ["healthcare", "rural health", "care coordination", "ASHA", "PHC", "India"],
  authors: [{ name: "Arogya Marg Team" }],
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0d9488",
};

import { I18nProvider } from "@/components/I18nProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="min-h-screen bg-clinical-bg font-sans antialiased">
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
