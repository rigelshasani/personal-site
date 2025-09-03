//./src/app/layout.tsx
import "@/styles/global.css";
import { bellota } from "@/fonts";
import type { Metadata } from "next";
import { SidebarLayout } from "@/components/SidebarLayout";
import { ProgressBar } from "@/components/ProgressBar";

export const metadata: Metadata = {
  title: {
    default: "Rigels · Thoughts & Analytics",
    template: "%s · Rigels",
  },
  description: "Personal essays and data projects.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={bellota.variable}>
      <body className="font-sans antialiased bg-bg text-foreground min-h-screen">
        <SidebarLayout>
          {children}
        </SidebarLayout>
        <ProgressBar />
      </body>
    </html>
  );
}