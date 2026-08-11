import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { WispProvider } from "@/context/WispContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Extreme Fiber | WISP Staff Operations & Billing Suite",
  description: "Manage WiFi subscribers, DC/Active status, billing, daily money chores, and user complaints.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500 selection:text-white`}>
        <WispProvider>
          {children}
        </WispProvider>
      </body>
    </html>
  );
}

