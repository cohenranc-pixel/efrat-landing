import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const siteUrl = "https://efrat-landing.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "אפרת כהן · שיעורים פרטיים והוראה מותאמת באנגלית ומתמטיקה",
  description:
    "שיעורים פרטיים והוראה מותאמת לילדים ונוער — פרונטלי (במקומות נבחרים) או בזום. התמחות באנגלית, הכנה לבגרויות, מעל 13 שנות ניסיון.",
  alternates: { canonical: siteUrl },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "אפרת כהן · שיעורים פרטיים והוראה מותאמת",
    description:
      "ללמוד. להבין. להצליח — הוראה מותאמת באנגלית ומתמטיקה לילדים ונוער, פרונטלי או בזום.",
    siteName: "אפרת כהן · שיעורים פרטיים",
  },
  twitter: {
    card: "summary_large_image",
    title: "אפרת כהן · שיעורים פרטיים והוראה מותאמת",
    description:
      "ללמוד. להבין. להצליח — הוראה מותאמת באנגלית ומתמטיקה לילדים ונוער.",
  },
  robots: { index: true, follow: true },
  // ניתן להפעיל אם נרשמת לאימות של Google Search Console:
  // other: { "google-site-verification": "PASTE_TOKEN_HERE" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <meta name="description" content="שיעורים פרטיים והוראה מותאמת לילדים ונוער — פרונטלי (במקומות נבחרים) או בזום. התמחות באנגלית, הכנה לבגרויות, מעל 13 שנות ניסיון." />
        <meta property="og:locale" content="he_IL" />
        <meta name="google" content="notranslate" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
