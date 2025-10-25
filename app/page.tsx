'use client';
import type { FormEvent } from 'react';

export const metadata = {
  title: "אפרת כהן · שיעורים פרטיים והוראה מותאמת באנגלית ומתמטיקה",
  description:
    "שיעורים פרטיים והוראה מותאמת לילדים ונוער — פרונטלי (במקומות נבחרים) או בזום. התמחות באנגלית, הכנה לבגרויות, מעל 13 שנות ניסיון.",
  openGraph: {
    title: "אפרת כהן · שיעורים פרטיים והוראה מותאמת",
    description:
      "ללמוד. להבין. להצליח — הוראה מותאמת באנגלית ומתמטיקה לילדים ונוער, פרונטלי או בזום.",
    url: "https://efrat-landing.vercel.app",
    siteName: "אפרת כהן · שיעורים פרטיים",
    locale: "he_IL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "אפרת כהן · שיעורים פרטיים והוראה מותאמת",
    description:
      "ללמוד. להבין. להצליח — הוראה מותאמת באנגלית ומתמטיקה לילדים ונוער.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://efrat-landing.vercel.app",
  },
};

export default function TutoringLanding() {
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());

    try {
      const url = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL as string;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        document.getElementById('form-success')?.classList.remove('hidden');
        e.currentTarget.reset();
      } else {
        console.error('n8n webhook failed', res.status);
      }
    } catch (err) {
      console.error('Network error posting to n8n', err);
    }
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-sky-50 to-white text-gray-800">
      {/* כל הקוד שלך כאן נשאר בדיוק כמו שהיה */}
      {/* Hero, Form, CTA, Footer וכו' */}
    </div>
  );
}
