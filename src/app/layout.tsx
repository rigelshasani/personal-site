//./src/app/layout.tsx
import "@/styles/global.css";
import { bellota } from "@/fonts";
import type { Metadata } from "next";
import { SidebarLayout } from "@/components/SidebarLayout";
import { ProgressBar } from "@/components/ProgressBar";
import { DevToolbar } from "@/components/DevToolbar";
import { SessionProvider } from "@/components/SessionProvider";
import { AdminLoginButton } from "@/components/AdminLoginButton";
import { ToastProvider } from "@/components/Toast";

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
      <head>
        {/* Prevent theme flicker by applying saved theme before hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {try {var t=localStorage.getItem('theme');var d=t==='dark';var r=document.documentElement;if(d){r.classList.add('dark');r.style.setProperty('--background','#0d0d0d');r.style.setProperty('--foreground','#fafafa');r.style.setProperty('--text-mid','#999999');r.style.setProperty('--color-accent','#10a37f');}else{r.classList.remove('dark');r.style.setProperty('--background','#ffffff');r.style.setProperty('--foreground','#171717');r.style.setProperty('--text-mid','#666666');r.style.setProperty('--color-accent','#1e40af');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-bg text-foreground min-h-screen">
        <SessionProvider>
          <ToastProvider>
            <SidebarLayout>
              {children}
            </SidebarLayout>
            <ProgressBar />
            <DevToolbar />
            <AdminLoginButton />
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
