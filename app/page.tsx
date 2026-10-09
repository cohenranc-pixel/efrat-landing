import TutoringLanding from './_components/TutoringLanding';

const siteUrl = 'https://efrat-landing.vercel.app';

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': siteUrl + '/#teacher',
      name: 'אפרת כהן',
      jobTitle: 'מורה פרטית להוראה מותאמת',
      description: 'בעלת תואר שני בלקויות למידה ומעל 13 שנות ניסיון בהוראה מותאמת והגשה לבגרויות.',
      url: siteUrl,
      telephone: '+972546154115',
    },
    {
      '@type': 'Service',
      '@id': siteUrl + '/#tutoring',
      name: 'שיעורים פרטיים והוראה מותאמת במודיעין',
      serviceType: 'שיעורים פרטיים באנגלית, מתמטיקה ומקצועות רבי־מלל והכנה לבגרויות',
      provider: { '@id': siteUrl + '/#teacher' },
      areaServed: { '@type': 'City', name: 'מודיעין־מכבים־רעות' },
      description: 'לילדי בית ספר יסודי עד תיכון. מפגשים אישיים או קבוצתיים, פרונטלי במודיעין או מקוון בזום.',
      url: siteUrl,
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />
      <TutoringLanding />
    </>
  );
}
