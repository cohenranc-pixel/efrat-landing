import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const siteUrl = "https://efrat-landing.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "אפרת כהן — שיעורים פרטיים והוראה מותאמת במודיעין",
  description: "שיעורים פרטיים במודיעין באנגלית, מתמטיקה ומקצועות רבי־מלל, לילדי יסודי עד תיכון. הוראה מותאמת והכנה לבגרויות עם מעל 13 שנות ניסיון. גם אונליין בזום.",
  alternates: { canonical: siteUrl },
  authors: [{ name: "אפרת כהן" }],
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "אפרת כהן — שיעורים פרטיים והוראה מותאמת במודיעין",
    description: "לימוד אישי או קבוצתי במודיעין ובזום, מיסודי עד תיכון. התמחות באנגלית והכנה לבגרויות.",
    siteName: "אפרת כהן · שיעורים פרטיים",
    locale: "he_IL",
  },
  twitter: {
    card: "summary",
    title: "אפרת כהן — שיעורים פרטיים במודיעין",
    description: "הוראה מותאמת באנגלית, מתמטיקה ומקצועות רבי־מלל. במודיעין או בזום.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
