import CTA from "./CTA";
import COPY from "./copy";

/**
 * ScreenOne — Hero (God-Tier v2)
 * Implements: Color system, spatial rhythm, material depth, typography, bullets, single-run motion.
 */
export default function ScreenOne() {
  const t = COPY;

  return (
    <section className="z2-hero" role="region" aria-labelledby="z2-hero-title">
      <div className="z2-hero__content">
        <header className="z2-hero__head">
          <h1 id="z2-hero-title" className="z2-hero__title">{t.title}</h1>
          <p className="z2-hero__sub">{t.sub1}</p>
          <p className="z2-hero__sub">{t.sub2}</p>
        </header>

        <ul className="z2-hero__list" aria-label="What you will see">
          {t.bullets.map((b: string, i: number) => (
            <li key={i} className="z2-hero__item">
              <span className="z2-hero__dot" aria-hidden="true" />
              <span className="z2-hero__text">{b}</span>
            </li>
          ))}
        </ul>

        <div className="z2-hero__cta">
          <CTA label={t.cta} />
          <p className="z2-hero__support">{t.support}</p>
        </div>

        <footer className="z2-hero__footer">
          <span>{t.footer.privacy}</span>
          <span className="dot">•</span>
          <span>{t.footer.security}</span>
        </footer>
      </div>

      <style>{`
        /* ===== Tokens (按你的线性优化顺序) ===== */
        .z2-hero{
          --bg1:#1A1A2E;         /* Midnight Blue */
          --bg2:#1E1E32;         /* Slightly lighter for gradient depth */
          --gold:#B8956A;        /* Matte gold */
          --goldHi:#D4AF8C;      /* Hover highlight */
          --text:#F5F5F0;        /* Warm white */
          --muted:#C8C8C0;       /* Secondary text */
          --overlay: rgba(0,0,0,.22);
          --g8:8px;

          position:relative;
          min-height:100vh;
          color:var(--text);

          /* 深蓝纵向渐变 + 顶部金色光源 + 微噪点叠加 */
          background:
            radial-gradient(520px 340px at 48% -90px, rgba(212,175,140,.85) 0%, rgba(201,169,97,.55) 38%, rgba(201,169,97,0) 70%),
            linear-gradient(180deg, var(--bg1) 0%, var(--bg2) 55%, var(--bg1) 100%);
          isolation:isolate;
        }
        /* 超轻噪点层（材质） */
        .z2-hero::after{
          content:"";
          position:absolute; inset:0;
          pointer-events:none; opacity:.06; mix-blend:overlay;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .25 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        /* 内容卡：80% 宽度上限，梯度边框 + 内外阴影（克制） */
        .z2-hero__content{
          width:100%;
          max-width:960px;
          margin:0 auto;
          padding:96px 20px 72px;
          background:
            linear-gradient(#16213E,#16213E) padding-box,
            linear-gradient(135deg, var(--gold), transparent) border-box;
          border:1px solid transparent;
          border-radius:16px;
          box-shadow:
            0 8px 32px rgba(0,0,0,.30),
            inset 0 2px 4px rgba(255,255,255,.05);
          backdrop-filter:saturate(110%) blur(0.5px);
          animation: z2-fade-up .6s cubic-bezier(.23,1,.32,1) both;
        }
        @media (max-width:768px){
          .z2-hero__content{ padding:80px 16px 56px; }
        }

        /* 排版：衬线标题 + 易读正文（如需，可在 index.html 引入字体） */
        .z2-hero__title{
          font-family: "Playfair Display", Georgia, serif;
          font-size:38px; line-height:1.15; font-weight:600; letter-spacing:-.02em;
          margin:0 0 24px 0; max-width:80%;
        }
        .z2-hero__sub{
          font-family: "Lora", Georgia, serif;
          font-size:20px; line-height:1.5; margin:0; max-width:80%;
          opacity:.92;
        }
        .z2-hero__sub + .z2-hero__sub{ margin-top:6px; }

        /* 列表：2-3条，16px 组距，金色圆点 16px */
        .z2-hero__list{ margin:40px 0 0 0; padding:0; list-style:none; }
        .z2-hero__item{ display:flex; gap:var(--g8); align-items:flex-start; margin-top:16px; }
        .z2-hero__dot{
          width:16px; height:16px; border-radius:999px; flex:0 0 16px;
          background: radial-gradient(circle at 40% 40%, var(--goldHi), var(--gold));
          transform: translateY(4px);
        }
        .z2-hero__text{
          font-size:16px; line-height:1.65; font-family:"Lora", Georgia, serif;
        }

        /* CTA 模块：与列表间距 56px（心理停顿） */
        .z2-hero__cta{ margin-top:56px; }
        .z2-hero__support{
          margin-top:10px; font-size:13px; line-height:1.45; color:var(--muted);
        }

        /* 页脚微文案：仅隐私/安全 */
        .z2-hero__footer{
          margin-top:20px; font-size:12px; line-height:1.45; color:rgba(245,245,240,.72);
          display:flex; gap:8px; align-items:center;
        }
        .z2-hero__footer .dot{ opacity:.5; }

        /* 单次淡入动效 + Stagger（视觉秩序） */
        .z2-hero__head{ animation: z2-fade-up .6s cubic-bezier(.23,1,.32,1) both .0s; }
        .z2-hero__list{ animation: z2-fade-up .6s cubic-bezier(.23,1,.32,1) both .15s; }
        .z2-hero__cta{  animation: z2-fade-up .6s cubic-bezier(.23,1,.32,1) both .30s; }
        .z2-hero__footer{ animation: z2-fade-up .6s cubic-bezier(.23,1,.32,1) both .45s; }

        @keyframes z2-fade-up{
          from{ opacity:0; transform: translateY(20px); }
          to{ opacity:1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}

export { default as ScreenTwoFront } from './ScreenTwoFront';

export { default as ScreenTwoBack }  from './ScreenTwoBack';
