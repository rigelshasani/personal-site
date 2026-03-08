//./src/app/layout.tsx
import "@/styles/global.css";
import { bellota } from "@/fonts";
import type { Metadata } from "next";
import { DevToolbar } from "@/components/DevToolbar";
import { SessionProvider } from "@/components/SessionProvider";
import { AdminLoginButton } from "@/components/AdminLoginButton";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rigels.dev'),
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
    <html lang="en" className={bellota.variable} suppressHydrationWarning>
      <head>
        {/* Prevent theme flicker — only toggles .dark class, CSS handles variables */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {try {var t=localStorage.getItem('theme');var r=document.documentElement;if(t==='dark'){r.classList.add('dark');}else if(t==='light'){r.classList.remove('dark');}else if(window.matchMedia('(prefers-color-scheme: dark)').matches){r.classList.add('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-bg text-foreground min-h-screen">
        <SessionProvider>
          <ToastProvider>
            {children}
            <DevToolbar />
            <AdminLoginButton />
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
