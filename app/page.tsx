'use client';
// Revision 1.2 — POST form data to n8n via NEXT_PUBLIC_N8N_WEBHOOK_URL
import type { FormEvent } from 'react';

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
        // Optional: surface a friendly message to users in production
      }
    } catch (err) {
      console.error('Network error posting to n8n', err);
      // Optional: surface a friendly message to users in production
    }
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-sky-50 to-white text-gray-800">
      {/* Top bar */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold">אפרת כהן · שיעורים פרטיים</span>
          </div>
          <a href="#contact" className="px-4 py-2 rounded-2xl shadow-sm bg-teal-600 text-white hover:bg-teal-700 transition">
            דברו איתי עכשיו
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 py-12 md:py-16 grid md:grid-cols-2 items-center gap-8">
          <div className="order-2 md:order-1">
            <h1 className="text-3xl md:text-5xl font-extrabold leading-[1.1] mb-4">
              ללמוד. להבין. להצליח
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-6">
              שיעורים פרטיים והוראה מותאמת במקצועות רבי־מלל, <span className="font-semibold">עם התמחות באנגלית</span> — כולל הכנה לבגרויות. דגש על פיתוח מיומנויות למידה, אסטרטגיות וכלים להצלחה.
            </p>
            <ul className="space-y-2 text-slate-700">
              <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-teal-600"/> הוראה מותאמת אישית, יחס חם ואמון.</li>
              <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-teal-600"/> בניית ביטחון עצמי בלמידה ותחושת מסוגלות.</li>
              <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-teal-600"/> מפגשים אישיים או קבוצתיים — פרונטלי (מתקיימים במודיעין) או מקוונים מרחוק (בזום).</li>
              <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-teal-600"/> מעל 13 שנות ניסיון בהוראה מותאמת והגשה לבגרויות.</li>
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#contact" className="px-5 py-3 rounded-2xl shadow bg-teal-600 text-white hover:bg-teal-700 transition text-lg">השאירו פרטים</a>
              <a href="tel:0546154115" className="px-5 py-3 rounded-2xl shadow border border-slate-300 hover:bg-white transition text-lg">☎️ 054-6154115</a>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="relative mx-auto max-w-md">
              <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full bg-teal-200/50 blur-2xl"/>
              <div className="absolute -bottom-10 -right-10 w-56 h-56 rounded-full bg-sky-200/50 blur-2xl"/>
              <div className="relative rounded-3xl p-6 md:p-8 bg-white shadow-xl border border-slate-100">
                <div className="text-center">
                  <div className="text-6xl">📚</div>
                  <p className="mt-3 text-slate-600">למידה שמרגישה בטוח, אישי ונעים.</p>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl border p-3 shadow-sm">הוראה מותאמת רבי מלל</div>
                  <div className="rounded-2xl border p-3 shadow-sm">הוראה מותאמת מתמטיקה</div>
                  <div className="rounded-2xl border p-3 shadow-sm">הוראה מותאמת אנגלית הנקרא</div>
                  <div className="rounded-2xl border p-3 shadow-sm">הכנה לבגרויות</div>
                </div>
                <a href="#contact" className="mt-6 block text-center w-full rounded-2xl py-3 bg-slate-900 text-white hover:bg-black transition">בואו נדבר</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Credibility */}
      <section className="px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-4 md:gap-6">
          {[
            {title: 'תואר שני בלקויות למידה', body: `הוראה מותאמת במקצועות רבי־מלל וגישת הוראה מותאמת גיל`},
            {title: 'שיטות שעובדות', body: 'אסטרטגיות למידה וכלים פרקטיים שמעלים את הביטחון ואת ההישגים.'},
            {title: 'ליווי מותאם', body: `גילאי בית ספר יסודי עד תיכון.\nפרונטלי (במקומות נבחרים) או אונליין בזום — מה שנוח למשפחה.`},
          ].map((card, i) => (
            <div key={i} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials section - currently hidden. Remove 'hidden' class when ready to show. */}
      <section className="px-4 mt-12 hidden">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">מה הורים מספרים</h2>
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {[
              '״אחרי חודש עם אפרת – הילדה חזרה לאהוב אנגלית.״',
              '״סוף סוף הוא ניגש למבחנים בביטחון, תודה!״',
              '״מקצועיות וסבלנות שאין כמוהן. ממליצים בחום.״',
            ].map((q, i) => (
              <blockquote key={i} className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm text-slate-700">{q}</blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact" className="px-4 mt-14 mb-20">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">נשמח לשוחח ולהתאים מסלול אישי</h2>
            <p className="text-slate-600 mb-6">השאירו פרטים קצרים ונחזור אליכם בהקדם.</p>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">שם ההורה</label>
                <input name="parentName" required className="w-full rounded-2xl border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="לדוגמה: דנה כהן" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">טלפון</label>
                <input name="phone" type="tel" required className="w-full rounded-2xl border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="054-0000000" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">כיתה/גיל</label>
                <input name="grade" className="w-full rounded-2xl border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="ד׳ / 10" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">מקצוע/מיקוד</label>
                <input name="subject" className="w-full rounded-2xl border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="אנגלית / הבנת הנקרא / בגרות" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">הודעה (רשות)</label>
                <textarea name="message" rows={4} className="w-full rounded-2xl border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="ספרו לנו בקצרה מה הצורך" />
              </div>
              <div className="md:col-span-2 flex flex-col md:flex-row items-start md:items-center gap-3">
                <button type="submit" className="rounded-2xl px-6 py-3 bg-teal-600 text-white hover:bg-teal-700 shadow transition">שלחו פרטים</button>
                <a href="tel:0546154115" className="rounded-2xl px-6 py-3 border border-slate-300 hover:bg-white shadow-sm transition">או התקשרו: 054-6154115</a>
              </div>
              <p id="form-success" className="hidden md:col-span-2 text-teal-700 bg-teal-50 border border-teal-200 rounded-2xl p-3 mt-2">תודה! הפרטים התקבלו ונחזור אליכם בהקדם.</p>
            </form>
          </div>
        </div>
      </section>

      {/* Sticky mobile CTA */}
      <a href="#contact" className="fixed md:hidden bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-xl bg-slate-900 text-white">
        השאירו פרטים
      </a>

      {/* Footer */}
      <footer className="px-4 pb-10">
        <div className="max-w-5xl mx-auto text-center text-slate-500">
          <p>© {new Date().getFullYear()} אפרת כהן — שיעורים פרטיים</p>
          <p className="mt-1">פרונטלי (במקומות נבחרים) או בזום · התמחות באנגלית · הכנה לבגרויות</p>
        </div>
      </footer>
    </div>
  );
}
