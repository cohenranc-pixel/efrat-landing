import type { Metadata } from 'next';
import TutoringLanding from './_components/TutoringLanding';

export const metadata: Metadata = {
  metadataBase: new URL('https://efrat-landing.vercel.app'),
  title: 'אפרת כהן - שיעורים פרטיים באנגלית ומקצועות רבי-מלל | הכנה לבגרות',
  description: 'שיעורים פרטיים ומותאמים באנגלית, מתמטיקה ומקצועות רבי-מלל. הכנה לבגרויות, למידה מותאמת אישית עם 13 שנות ניסיון. פרונטלי במודיעין או אונליין בזום.',
  keywords: ['שיעורים פרטיים', 'אנגלית', 'בגרות', 'הוראה מותאמת', 'מתמטיקה', 'הבנת הנקרא', 'מודיעין', 'לקויות למידה'],
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
};

export default function Page() {
  return <TutoringLanding />;
}