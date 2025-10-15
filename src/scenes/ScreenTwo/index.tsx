import CTA from "./CTA";
import COPY from "./copy";

/**
 * ScreenTwo — placeholder page (EN only)
 * Visual spec mirrors ScreenOne: deep blue-black bg, gold radial glow, unified overlay.
 */
export default function ScreenTwo() {
  const t = COPY;

  return (
    <section className="z2-s2" role="region" aria-labelledby="s2-title">
      <div className="z2-s2__content">
        <h1 id="s2-title" className="z2-s2__title">{t.title}</h1>

        <p className="z2-s2__sub">{t.sub1}</p>
        <p className="z2-s2__sub">{t.sub2}</p>

        <ul className="z2-s2__list" aria-label="What you receive">
          {t.bullets.map((b: string, i: number) => (
            <li key={i} className="z2-s2__item">
              <span className="z2-s2__dot" aria-hidden="true" />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <div className="z2-s2__cta">
          <CTA label={t.cta} />
          <p className="z2-s2__support">{t.support}</p>
        </div>

        <div className="z2-s2__footer">
          <span>{t.footer.privacy}</span>
          <span className="dot">·</span>
          <span>{t.footer.security}</span>
        </div>
      </div>

      <style>{`
        .z2-s2{
          --bg:#0A1128; --goldA:#D4AF37; --goldB:#C9A961; --white:#ffffff;
          position:relative; min-height:100vh; display:flex; align-items:flex-start;
          background:
            radial-gradient(520px 340px at 50% -70px, var(--goldA) 0%, var(--goldB) 42%, rgba(201,169,97,0) 70%),
            var(--bg);
          color:var(--white);
        }
        .z2-s2__content{
          width:100%; max-width:960px; margin:0 auto; padding:64px 20px 72px;
          background: rgba(0,0,0,.22);
          animation: z2-s2-fade .34s cubic-bezier(0.33,1,0.68,1) both;
        }
        @media (max-width:768px){
          .z2-s2__content{ padding:48px 16px 56px; }
        }
        .z2-s2__title{ font-size:30px; line-height:1.22; font-weight:600; letter-spacing:-0.01em; margin:0; }
        .z2-s2__sub{ margin-top:10px; font-size:16px; line-height:1.5; opacity:.9; max-width:80%; }
        .z2-s2__list{ margin:18px 0 0 0; padding:0; list-style:none; font-size:15.5px; line-height:1.5; }
        .z2-s2__item{ display:flex; gap:8px; align-items:flex-start; margin-top:14px; }
        .z2-s2__dot{ width:16px; height:16px; border-radius:999px; background:rgba(255,255,255,.9); flex:0 0 16px; transform: translateY(3px); }
        .z2-s2__cta{ margin-top:30px; }
        .z2-s2__support{ margin-top:8px; font-size:12.5px; opacity:.72; }
        .z2-s2__footer{ margin-top:18px; font-size:12.5px; opacity:.65; display:flex; gap:8px; align-items:center; }
        .z2-s2__footer .dot{ opacity:.5; }
        @keyframes z2-s2-fade{ from{ opacity:0; transform: translateY(12px); } to{ opacity:1; transform: translateY(0); } }
      `}</style>
    </section>
  );
}

/* -------------------------
   ✅ 新增命名导出（供路由按需引用）
   ------------------------- */
export { default as ScreenTwoFront } from "./ScreenTwoFront";
export { default as ScreenTwoBack } from "./ScreenTwoBack";
