import { ReactNode } from "react";
import Head from "next/head";
import Link from "next/link";

interface PageShellProps {
  children: ReactNode;
  title?: string;
  metaDescription?: string;
  showBack?: boolean;
  backHref?: string;
  rightElement?: ReactNode;
  className?: string;
  canonical?: string;
  ogImage?: string;
}

const SITE_NAME = "Life Compass";
const SITE_URL = "https://lifecompass.arishia.cyou";
const DEFAULT_DESC = "Temukan arah kariermu dengan lebih jelas. Gratis, 10 menit, berbasis data karir Indonesia.";
const DEFAULT_OG_IMAGE = "https://lifecompass.arishia.cyou/og-image.svg";

export default function PageShell({
  children, title, metaDescription, showBack,
  backHref = "/dashboard", rightElement, className = "",
  canonical, ogImage
}: PageShellProps) {
  const pageTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME;
  const desc = metaDescription || DEFAULT_DESC;
  const canon = canonical || (typeof window === "undefined" ? "" : window.location.href);

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={desc} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={desc} />
        <meta property="og:image" content={ogImage || DEFAULT_OG_IMAGE} />
        <meta property="og:url" content={canon} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {canon && <link rel="canonical" href={canon} />}
      </Head>
      <div className={`min-h-screen bg-warm ${className}`}>
        <nav className="bg-card border-b-2 border-ink px-6 py-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            {showBack && (
              <Link href={backHref} className="text-ink/50 hover:text-ink transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
            )}
            <Link href="/" className="text-xl font-bold text-ink">
              {SITE_NAME}
            </Link>
            {title && <span className="text-ink/30 text-sm hidden sm:inline">/ {title}</span>}
          </div>
          {rightElement && <div className="flex items-center gap-3">{rightElement}</div>}
        </nav>
        <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
          {children}
        </main>
      </div>
    </>
  );
}
