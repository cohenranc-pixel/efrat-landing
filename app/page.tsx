import type { Metadata } from 'next';
import TutoringLanding from './_components/TutoringLanding';
import Script from 'next/script';

export const metadata: Metadata = {
  metadataBase: new URL('https://efrat-landing.vercel.app'),
  title: 'אפרת כהן - שיעורים פרטיים באנגלית ומקצועות רבי-מלל | הכנה לבגרות',
  description: 'שיעורים פרטיים ומותאמים באנגלית, מתמטיקה ומקצועות רבי-מלל. הכנה לבגרויות, למידה מותאמת אישית עם 13 שנות ניסיון. פרונטלי במודיעין או אונליין בזום.',
  keywords: ['שיעורים פרטיים', 'אנגלית', 'בגרות', 'הוראה מותאמת', 'מתמטיקה', 'הבנת הנקרא', 'מודיעין', 'לקויות למידה', 'הכנה לבגרות אנגלית', 'מורה פרטי'],
  authors: [{ name: 'אפרת כהן' }],
  creator: 'אפרת כהן',
  publisher: 'אפרת כהן',
  openGraph: {
    title: 'אפרת כהן - שיעורים פרטיים באנגלית ומקצועות רבי-מלל',
    description: 'שיעורים פרטיים ומותאמים באנגלית, מתמטיקה ומקצועות רבי-מלל. הכנה לבגרויות עם 13 שנות ניסיון.',
    url: 'https://efrat-landing.vercel.app',
    siteName: 'אפרת כהן - שיעורים פרטיים',
    locale: 'he_IL',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://efrat-landing.vercel.app',
  },
};

export default function Page() {
  return (
    <>
      {/* Add JSON-LD Structured Data for better Google understanding */}
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'EducationalOrganization',
            name: 'אפרת כהן - שיעורים פרטיים',
            description: 'שיעורים פרטיים ומותאמים באנגלית, מתמטיקה ומקצועות רבי-מלל',
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'מודיעין',
              addressCountry: 'IL',
            },
            telephone: '054-6154115',
            url: 'https://efrat-landing.vercel.app',
            areaServed: {
              '@type': 'Place',
              name: 'ישראל',
            },
            availableLanguage: ['he', 'en'],
            offers: {
              '@type': 'Offer',
              description: 'שיעורים פרטיים באנגלית ומתמטיקה',
              availability: 'https://schema.org/InStock',
            },
            educationalCredentialAwarded: 'תואר שני בלקויות למידה',
          }),
        }}
      />
      <TutoringLanding />
    </>
  );
}