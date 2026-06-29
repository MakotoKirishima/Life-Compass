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
}

const SITE_NAME = "Life Compass";
const DEFAULT_DESC = "Temukan arah kariermu dengan lebih jelas. Gratis, 10 menit, berbasis data karir Indonesia.";

export default function PageShell({
  children, title, metaDescription, showBack,
  backHref = "/dashboard", rightElement, className = ""
}: PageShellProps) {
  const pageTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME;
  const desc = metaDescription || DEFAULT_DESC;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={desc} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={desc} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className={`min-h-screen bg-gray-50 ${className}`}>
        <nav className="bg-white shadow-sm border-b px-6 py-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            {showBack && (
              <Link href={backHref} className="text-gray-400 hover:text-gray-600 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
            )}
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              {SITE_NAME}
            </Link>
            {title && <span className="text-gray-300 text-sm hidden sm:inline">/ {title}</span>}
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
