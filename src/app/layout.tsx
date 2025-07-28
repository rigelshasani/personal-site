import "@/styles/global.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    default: "Rigels · Thoughts & Analytics",
    template: "%s · Rigels",
  },
  description: "Personal essays and data projects.",
};

const year = new Date().getFullYear();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-bg text-text-high">
        <header className="mx-auto max-w-6xl px-6 py-6 flex items-center">
          <Link href="/" className="font-semibold tracking-tight">
            Rigels
          </Link>
        </header>
        <main className="mx-auto max-w-6xl px-6">{children}</main>
        <footer
          className="mx-auto max-w-6xl px-6 py-10 text-sm text-text-mid"
          aria-label="Site footer"
        >
          ©{year} Rigels Hasani
        </footer>
        {/* thin progress bar */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                const bar=document.createElement('div');
                bar.style.cssText='position:fixed;top:0;left:0;height:2px;width:0;background:var(--color-accent);z-index:100';
                document.body.appendChild(bar);
                window.addEventListener('scroll',()=>{bar.style.width=(100*document.documentElement.scrollTop/(document.documentElement.scrollHeight-document.documentElement.clientHeight))+"%";},{passive:true});
              })();`,
          }}
        />
      </body>
    </html>
  );
}
