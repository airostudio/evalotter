import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { getCurrentUser } from "@/lib/auth/current-user";

export const metadata: Metadata = {
  title: {
    default: "Brainyak — Discover How Your Mind Works",
    template: "%s · Brainyak",
  },
  description:
    "Measure your reasoning, memory, emotional intelligence, creativity, spatial thinking and more through interactive assessments designed to reveal how you think.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col font-sans">
        <SiteHeader user={user} />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
