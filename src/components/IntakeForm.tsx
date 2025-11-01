// src/scenes/FormScreen/FormScreenWithGuides.tsx
import { useEffect, useRef, useState } from "react";

/* =====================================================================
   Cross-subdomain deduplication utilities
   ===================================================================== */
function getCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const list = (document.cookie || "").split("; ");
  for (const item of list) {
    const eq = item.indexOf("=");
    if (eq === -1) continue;
    const k = decodeURIComponent(item.slice(0, eq));
    const v = decodeURIComponent(item.slice(eq + 1));
    if (k === name) return v;
  }
  return "";
}

function setRootCookie(name: string, value: string, days: number) {
  try {
    const exp = new Date(Date.now() + days * 864e5).toUTCString();
    const isHttps = window.location.protocol === "https:";
    const secureFlag = isHttps ? "; Secure" : "";
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; domain=.faterewrite.com; expires=${exp}; SameSite=Lax${secureFlag}`;
    if (document.cookie.indexOf(name + "=") === -1) {
      document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; expires=${exp}; SameSite=Lax${secureFlag}`;
    }
  } catch {}
}

function markOnce(key: string, devMode: boolean = false): boolean {
  if (devMode && window.location.hostname === "localhost") {
    console.log(`[DEV] Event ${key} triggered (dev mode - no deduplication)`);
    return true;
  }
  const name = "frd_form_dedupe";
  const raw = getCookie(name);
  const set = new Set(raw ? raw.split(",") : []);
  if (set.has(key)) {
    console.log(`[Dedupe] Event ${key} already triggered, skipping`);
    return false;
  }
  set.add(key);
  setRootCookie(name, Array.from(set).join(","), 30);
  console.log(`[Track] Event ${key} first trigger ✓`);
  return true;
}

function ensureFrid() {
  const win: any = window as any;
  let frid = win.__frid || getCookie("frd_uid");
  if (!frid) {
    frid = "fr_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    setRootCookie("frd_uid", frid, 30);
  }
  if (!win.__frid) win.__frid = frid;
  return frid;
}

/* =====================================================================
   Form Data Structure
   ===================================================================== */
interface FormData {
  q1_scenarios: string[];
  q2_blocker: string;
  q3_type: string;
  q4_budget: string;
  q5_contact_method: string;
  q5_contact_value: string;
  q6_priority: string;
}

const Q1_OPTIONS = [
  { id: "dinner", text: "Dinner / drinks with a woman who actually shows up", icon: "🥂" },
  { id: "event", text: "A real date for an event / wedding / work night", icon: "🎭" },
  { id: "private", text: "Private, off-app time (no DMs, no talking phase)", icon: "🔒" },
  { id: "weekend", text: "Weekend escape / short trip with the right woman", icon: "✈️" },
  { id: "explore", text: "I want to see what's possible in my city", icon: "🌆" }
];

const Q2_OPTIONS = [
  { id: "ghosting", text: "They keep ghosting / canceling", icon: "👻" },
  { id: "fake", text: "Apps are full of fake / OF / escorts", icon: "⚠️" },
  { id: "time", text: "Don't have time to text 10 girls", icon: "⏰" },
  { id: "availability", text: "I don't know who is actually available this week", icon: "❓" },
  { id: "privacy", text: "I don't want public platforms to see me", icon: "🕶️" }
];

const Q3_OPTIONS = [
  { id: "looks", text: "Looks-first (pretty, feminine, IG-able)", tier: "VISUAL" },
  { id: "elegant", text: "Elegant / can be taken anywhere", tier: "PRESTIGE" },
  { id: "fun", text: "Fun / social / nightlife ready", tier: "ENERGY" },
  { id: "smart", text: "Smart / can hold a real conversation", tier: "INTELLECT" },
  { id: "recommend", text: "You recommend based on my city", tier: "CURATED" }
];

const Q4_OPTIONS = [
  { id: "testing", text: "I'm just testing", range: "under $500", level: "ENTRY" },
  { id: "evening", text: "$500–$1,200", range: "dinner / evening", level: "SELECT" },
  { id: "weekend", text: "$1,200–$3,000", range: "full night / weekend", level: "PREMIUM" },
  { id: "priority", text: "$3,000+", range: "priority + specific type", level: "ELITE" },
  { id: "depends", text: "Depends on the woman", range: "show me first", level: "FLEX" }
];

export default function FormScreenWithGuides() {
  const hasTrackedRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>("q1");
  
  const [formData, setFormData] = useState<FormData>({
    q1_scenarios: [],
    q2_blocker: "",
    q3_type: "",
    q4_budget: "",
    q5_contact_method: "", // 默认不选中任何联系方式
    q5_contact_value: "",
    q6_priority: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (hasTrackedRef.current) return;
    hasTrackedRef.current = true;
    const frid = ensureFrid();
    const isDev = window.location.hostname === "localhost";

    const loadTimer = setTimeout(() => {
      if (typeof (window as any).fbq !== "undefined" && markOnce("form_load", isDev)) {
        const eventId = "ev_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        (window as any).fbq("track", "ViewContent", {
          content_name: "Guided-Form-Loaded",
          content_category: "high-conversion-intake",
          currency: "USD",
          value: 197.0,
          user_id: frid,
        }, { eventID: eventId });
      }
    }, 600);

    return () => {
      clearTimeout(loadTimer);
    };
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (formData.q1_scenarios.length === 0) newErrors.q1 = "Select at least one";
    if (!formData.q2_blocker) newErrors.q2 = "Required";
    if (!formData.q3_type) newErrors.q3 = "Required";
    if (!formData.q4_budget) newErrors.q4 = "Required";
    if (!formData.q5_contact_method) newErrors.q5 = "Please select a contact method";
    if (!formData.q5_contact_value.trim()) newErrors.q5 = "We need a way to reach you";
    if (!formData.q6_priority.trim()) newErrors.q6 = "Tell us what matters most";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    const frid = ensureFrid();

    if (typeof (window as any).fbq !== "undefined") {
      const eventId = "ev_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      (window as any).fbq("track", "Lead", {
        content_name: "Guided_Form_Submitted",
        user_id: frid,
      }, { eventID: eventId });
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log("Form Submitted:", formData);
      setShowSuccess(true);
      setTimeout(() => {
        window.location.href = "https://pay.faterewrite.com/";
      }, 2500);
    } catch (error) {
      console.error("Submission error:", error);
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="compact-form-container">
        <div className="compact-success">
          <div className="success-icon">✓</div>
          <h2 className="success-title">REQUEST CONFIRMED</h2>
          <p className="success-text">Redirecting to payment portal...</p>
        </div>
        <style>{compactStyles}</style>
      </div>
    );
  }

  return (
    <div className="compact-form-container">
      <div className="compact-form-inner">
        
        {/* Header */}
        <header className={`compact-header ${expandedQuestion ? 'header-hidden' : ''}`}>
          <div className="header-badge">CONFIDENTIAL INTAKE</div>
          <h1 className="compact-title">Tell us what you really want this week.</h1>
          <p className="compact-subtitle">So we can send you real women, not chat.</p>
          
          {/* 开始前的引导+煽动文案 */}
          <div className="pre-form-guide">
            <p className="guide-main">Answer 5 questions. Get real photos within 2 hours.</p>
            <p className="guide-sub">We only show you women who are actually available this week. No bots. No flakes. No endless texting.</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="compact-form">
          
          {/* Q1 */}
          <div className="form-block" id="question-q1">
            <button
              type="button"
              className="block-header-btn"
              onClick={() => setExpandedQuestion(expandedQuestion === "q1" ? null : "q1")}
            >
              <span className="block-num">01</span>
              <div className="block-header-text">
                <h3 className="block-title">What do you actually want this week?</h3>
                <p className="block-hint">Select all • We only show women who can actually deliver this</p>
              </div>
              <span className={`expand-icon ${expandedQuestion === "q1" ? "expanded" : ""}`}>›</span>
            </button>
            {expandedQuestion === "q1" && (
              <div className="options-list">
                {Q1_OPTIONS.map((opt) => {
                  const isSelected = formData.q1_scenarios.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className={`opt-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        setTouchedFields(p => ({ ...p, q1: true }));
                        setFormData(p => ({
                          ...p,
                          q1_scenarios: p.q1_scenarios.includes(opt.id)
                            ? p.q1_scenarios.filter(s => s !== opt.id)
                            : [...p.q1_scenarios, opt.id]
                        }));
                      }}
                    >
                      <span className="opt-icon">{opt.icon}</span>
                      <span className="opt-text">{opt.text}</span>
                      <span className="opt-check">{isSelected && '✓'}</span>
                    </button>
                  );
                })}
                {errors.q1 && touchedFields.q1 && <div className="error">{errors.q1}</div>}
              </div>
            )}
          </div>

          {/* Q2 */}
          <div className="form-block" id="question-q2">
            <button
              type="button"
              className="block-header-btn"
              onClick={() => setExpandedQuestion(expandedQuestion === "q2" ? null : "q2")}
            >
              <span className="block-num">02</span>
              <div className="block-header-text">
                <h3 className="block-title">Why haven't you done this yet?</h3>
                <p className="block-hint">Pick your biggest frustration • We solve it in 2 hours</p>
              </div>
              <span className={`expand-icon ${expandedQuestion === "q2" ? "expanded" : ""}`}>›</span>
            </button>
            {expandedQuestion === "q2" && (
              <div className="options-list">
                {Q2_OPTIONS.map((opt) => {
                  const isSelected = formData.q2_blocker === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className={`opt-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        setTouchedFields(p => ({ ...p, q2: true }));
                        setFormData(p => ({ ...p, q2_blocker: opt.id }));
                      }}
                    >
                      <span className="opt-icon">{opt.icon}</span>
                      <span className="opt-text">{opt.text}</span>
                      <span className="opt-radio">{isSelected && '●'}</span>
                    </button>
                  );
                })}
                {errors.q2 && touchedFields.q2 && <div className="error">{errors.q2}</div>}
              </div>
            )}
          </div>

          {/* Q3 */}
          <div className="form-block" id="question-q3">
            <button
              type="button"
              className="block-header-btn"
              onClick={() => setExpandedQuestion(expandedQuestion === "q3" ? null : "q3")}
            >
              <span className="block-num">03</span>
              <div className="block-header-text">
                <h3 className="block-title">What type are you looking for?</h3>
                <p className="block-hint">This determines which women see your request first</p>
              </div>
              <span className={`expand-icon ${expandedQuestion === "q3" ? "expanded" : ""}`}>›</span>
            </button>
            {expandedQuestion === "q3" && (
              <div className="options-list">
                {Q3_OPTIONS.map((opt) => {
                  const isSelected = formData.q3_type === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className={`opt-btn tier ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        setTouchedFields(p => ({ ...p, q3: true }));
                        setFormData(p => ({ ...p, q3_type: opt.id }));
                      }}
                    >
                      <span className="tier-badge">{opt.tier}</span>
                      <span className="opt-text">{opt.text}</span>
                      <span className="opt-radio">{isSelected && '●'}</span>
                    </button>
                  );
                })}
                {errors.q3 && touchedFields.q3 && <div className="error">{errors.q3}</div>}
              </div>
            )}
          </div>

          {/* Q4 */}
          <div className="form-block" id="question-q4">
            <button
              type="button"
              className="block-header-btn"
              onClick={() => setExpandedQuestion(expandedQuestion === "q4" ? null : "q4")}
            >
              <span className="block-num">04</span>
              <div className="block-header-text">
                <h3 className="block-title">What's your budget range?</h3>
                <p className="block-hint">Higher budget = priority access + same-day matches</p>
              </div>
              <span className={`expand-icon ${expandedQuestion === "q4" ? "expanded" : ""}`}>›</span>
            </button>
            {expandedQuestion === "q4" && (
              <div className="options-list">
                {Q4_OPTIONS.map((opt) => {
                  const isSelected = formData.q4_budget === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className={`opt-btn budget ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        setTouchedFields(p => ({ ...p, q4: true }));
                        setFormData(p => ({ ...p, q4_budget: opt.id }));
                      }}
                    >
                      <div className="opt-content">
                        <span className="opt-text-main">{opt.text}</span>
                        <span className="opt-text-sub">{opt.range}</span>
                      </div>
                      <span className="opt-radio">{isSelected && '●'}</span>
                    </button>
                  );
                })}
                {errors.q4 && touchedFields.q4 && <div className="error">{errors.q4}</div>}
              </div>
            )}
          </div>

          {/* Q5 - What matters most (REQUIRED) */}
          <div className="form-block" id="question-q5">
            <button
              type="button"
              className="block-header-btn"
              onClick={() => setExpandedQuestion(expandedQuestion === "q5" ? null : "q5")}
            >
              <span className="block-num">05</span>
              <div className="block-header-text">
                <h3 className="block-title">What matters most?</h3>
                <p className="block-hint">Required • This one line filters out 90% of the wrong women</p>
              </div>
              <span className={`expand-icon ${expandedQuestion === "q5" ? "expanded" : ""}`}>›</span>
            </button>
            {expandedQuestion === "q5" && (
              <div className="options-list">
                <textarea
                  className="compact-textarea"
                  placeholder="e.g. must be real and on time / not an escort / classy enough for dinner / doesn't flake"
                  maxLength={80}
                  rows={2}
                  value={formData.q6_priority}
                  onChange={(e) => {
                    setTouchedFields(p => ({ ...p, q6: true }));
                    setFormData(p => ({ ...p, q6_priority: e.target.value }));
                  }}
                />
                <p className="question-guide">
                  <span className="guide-icon">✨</span>
                  This one line helps us send you exactly who you want. Most men skip it — don't.
                </p>
                {errors.q6 && touchedFields.q6 && <div className="error">{errors.q6}</div>}
              </div>
            )}
          </div>

          {/* Contact Info Section (Not a question - always visible) */}
          <div className="contact-section">
            <div className="contact-section-header">
              <h3 className="contact-section-title">Where should we send the roster?</h3>
              <p className="contact-section-hint">Required • Photos arrive within 2 hours (usually faster)</p>
            </div>
            <div className="contact-section-content">
              <div className="contact-tabs">
                {/* WhatsApp */}
                <button
                  type="button"
                  className={`contact-tab ${formData.q5_contact_method === 'whatsapp' ? 'active' : ''}`}
                  onClick={() => setFormData(p => ({ ...p, q5_contact_method: 'whatsapp' }))}
                >
                  <span className="contact-radio">
                    {formData.q5_contact_method === 'whatsapp' && <span className="radio-dot"></span>}
                  </span>
                  <svg className="contact-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="currentColor"/>
                  </svg>
                  <span className="contact-label">WhatsApp</span>
                </button>

                {/* Telegram */}
                <button
                  type="button"
                  className={`contact-tab ${formData.q5_contact_method === 'telegram' ? 'active' : ''}`}
                  onClick={() => setFormData(p => ({ ...p, q5_contact_method: 'telegram' }))}
                >
                  <span className="contact-radio">
                    {formData.q5_contact_method === 'telegram' && <span className="radio-dot"></span>}
                  </span>
                  <svg className="contact-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.68c.223-.198-.054-.308-.346-.11l-6.4 4.03-2.76-.918c-.6-.187-.612-.6.125-.89l10.782-4.156c.5-.18.943.11.78.89z" fill="currentColor"/>
                  </svg>
                  <span className="contact-label">Telegram</span>
                </button>

                {/* Email */}
                <button
                  type="button"
                  className={`contact-tab ${formData.q5_contact_method === 'email' ? 'active' : ''}`}
                  onClick={() => setFormData(p => ({ ...p, q5_contact_method: 'email' }))}
                >
                  <span className="contact-radio">
                    {formData.q5_contact_method === 'email' && <span className="radio-dot"></span>}
                  </span>
                  <span className="contact-icon-emoji">📧</span>
                  <span className="contact-label">Email</span>
                </button>
              </div>
              <input
                type="text"
                className="compact-input"
                placeholder={
                  formData.q5_contact_method === 'whatsapp' ? '+1 (555) 000-0000' :
                  formData.q5_contact_method === 'telegram' ? '@username' :
                  'your@email.com'
                }
                value={formData.q5_contact_value}
                onChange={(e) => {
                  setTouchedFields(p => ({ ...p, q5: true }));
                  setFormData(p => ({ ...p, q5_contact_value: e.target.value }));
                }}
              />
              <p className="contact-privacy">
                🔒 100% discreet. No one else sees your info.
              </p>
              {errors.q5 && touchedFields.q5 && <div className="error">{errors.q5}</div>}
            </div>
          </div>

          {/* Footer */}
          <div className="form-footer">
            <p className="footer-note">Review typically takes 1-2 hours. Limited spots available.</p>
          </div>

          {/* Submit */}
          <button type="submit" className="compact-submit" disabled={isSubmitting}>
            {isSubmitting ? "PROCESSING..." : "SUBMIT REQUEST — SEE THIS WEEK'S ROSTER"}
          </button>

        </form>
      </div>

      <style>{compactStyles}</style>
    </div>
  );
}

const compactStyles = `
  /* ============= VACHERON BACKGROUND (INLINE) ============= */
  .compact-form-container {
    position: relative;
    width: 100%;
    min-height: 100vh;
    background: #0A1128;
    isolation: isolate;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .compact-form-container::before {
    content: "";
    position: fixed;
    inset: 0;
    z-index: 0;
    background: linear-gradient(180deg, #1A1E38 0%, #1E2240 46%, #1A1E38 100%);
  }

  .compact-form-container::after {
    content: "";
    position: fixed;
    inset: 0;
    z-index: 1;
    background: 
      radial-gradient(ellipse 130% 85% at 50% 15%, rgba(20, 38, 72, 0.72) 0%, rgba(12, 22, 48, 0.35) 35%, transparent 65%),
      linear-gradient(180deg, rgba(14, 24, 50, 0.55) 0%, rgba(10, 18, 40, 0.15) 25%, rgba(10, 18, 40, 0) 50%, rgba(10, 18, 40, 0.18) 75%, rgba(10, 18, 40, 0.45) 100%);
  }

  /* ============= COMPACT FORM LAYOUT ============= */
  .compact-form-inner {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 420px;
    margin: 0 auto;
    padding: 8px 12px 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  /* ============= HEADER ============= */
  .compact-header {
    text-align: center;
    padding: 4px 0 6px;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    max-height: 500px;
    opacity: 1;
    overflow: hidden;
  }

  .compact-header.header-hidden {
    max-height: 0;
    opacity: 0;
    padding: 0;
    margin: 0;
    pointer-events: none;
  }

  .header-badge {
    display: inline-block;
    padding: 3px 10px;
    background: linear-gradient(135deg, rgba(212, 185, 119, 0.15) 0%, rgba(184, 157, 95, 0.1) 100%);
    border: 1px solid rgba(212, 185, 119, 0.3);
    border-radius: 12px;
    font-size: 7px;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: #D4B977;
    margin-bottom: 8px;
  }

  .compact-title {
    font-size: 16px;
    font-weight: 800;
    line-height: 1.2;
    color: #FFFFFF;
    margin: 0 0 6px 0;
    letter-spacing: -0.01em;
  }

  .compact-subtitle {
    font-size: 10px;
    font-weight: 500;
    line-height: 1.3;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
    font-style: italic;
  }

  /* ============= PRE-FORM GUIDE ============= */
  .pre-form-guide {
    margin-top: 12px;
    padding: 10px 12px;
    background: linear-gradient(135deg, rgba(212, 185, 119, 0.1) 0%, rgba(184, 157, 95, 0.06) 100%);
    border: 1px solid rgba(212, 185, 119, 0.25);
    border-radius: 6px;
    text-align: center;
  }

  .guide-main {
    font-size: 10px;
    font-weight: 700;
    color: #E8D4A0;
    margin: 0 0 4px 0;
    line-height: 1.3;
    letter-spacing: 0.01em;
  }

  .guide-sub {
    font-size: 8px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
    line-height: 1.4;
  }

  /* ============= FORM BLOCKS ============= */
  .compact-form {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .form-block {
    border-bottom: 1px solid rgba(212, 185, 119, 0.15);
  }

  .form-block.always-open {
    border-bottom: 1px solid rgba(212, 185, 119, 0.2);
  }

  .block-header-btn {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 8px;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: inherit;
    text-align: left;
  }

  .block-header-btn:hover {
    background: rgba(212, 185, 119, 0.05);
  }

  .block-header-static {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 8px;
  }

  .block-header-text {
    flex: 1;
    min-width: 0;
  }

  .block-num {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(212, 185, 119, 0.2) 0%, rgba(184, 157, 95, 0.15) 100%);
    border: 1px solid rgba(212, 185, 119, 0.4);
    border-radius: 4px;
    font-size: 11px;
    font-weight: 800;
    color: #E8D4A0;
  }

  .block-title {
    font-size: 11px;
    font-weight: 700;
    color: #FFFFFF;
    margin: 0 0 2px 0;
    line-height: 1.2;
  }

  .block-hint {
    font-size: 7.5px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.4);
    margin: 0;
    font-style: italic;
    line-height: 1.3;
  }

  .optional {
    font-weight: 400;
    color: rgba(255, 255, 255, 0.5);
  }

  .expand-icon {
    flex-shrink: 0;
    font-size: 20px;
    color: rgba(212, 185, 119, 0.6);
    transition: transform 0.3s ease;
    transform: rotate(0deg);
    line-height: 1;
  }

  .expand-icon.expanded {
    transform: rotate(90deg);
  }

  /* Question content area */
  .question-content {
    padding: 0 8px 8px 42px;
    animation: slideDown 0.3s ease-out;
  }

  .question-content.always-visible {
    padding: 0 8px 8px 42px;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* ============= OPTIONS ============= */
  .options-list {
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: 0 8px 8px 42px;
    animation: slideDown 0.3s ease-out;
  }

  .opt-btn {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 8px;
    background: transparent;
    border: 1px solid rgba(212, 185, 119, 0.2);
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: left;
    font-family: inherit;
    color: inherit;
  }

  .opt-btn:hover {
    border-color: rgba(212, 185, 119, 0.4);
    background: rgba(212, 185, 119, 0.05);
  }

  .opt-btn.selected {
    border-color: rgba(212, 185, 119, 0.6);
    background: rgba(212, 185, 119, 0.1);
    box-shadow: 0 0 0 1px rgba(212, 185, 119, 0.3), inset 0 0 16px rgba(212, 185, 119, 0.08);
  }

  .opt-icon {
    flex-shrink: 0;
    font-size: 14px;
    width: 20px;
    text-align: center;
  }

  .opt-text {
    flex: 1;
    font-size: 9px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.85);
    line-height: 1.3;
  }

  .opt-btn.selected .opt-text {
    color: #FFFFFF;
  }

  .opt-check {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    color: #000000;
    background: transparent;
  }

  .opt-btn.selected .opt-check {
    background: linear-gradient(135deg, #E8D4A0 0%, #B89D5F 100%);
    border-color: #D4B977;
  }

  .opt-radio {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 8px;
    color: #D4B977;
  }

  .opt-btn.selected .opt-radio {
    border-color: #D4B977;
    background: rgba(212, 185, 119, 0.15);
  }

  /* Tier options */
  .opt-btn.tier {
    position: relative;
  }

  .tier-badge {
    position: absolute;
    top: 4px;
    right: 6px;
    padding: 2px 6px;
    background: rgba(212, 185, 119, 0.15);
    border: 1px solid rgba(212, 185, 119, 0.25);
    border-radius: 3px;
    font-size: 6px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: #D4B977;
  }

  .opt-btn.tier.selected .tier-badge {
    background: rgba(212, 185, 119, 0.25);
    border-color: rgba(212, 185, 119, 0.4);
  }

  /* Budget options */
  .opt-btn.budget {
    position: relative;
  }

  .opt-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .opt-text-main {
    font-size: 10px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.2;
  }

  .opt-btn.selected .opt-text-main {
    color: #FFFFFF;
  }

  .opt-text-sub {
    font-size: 8px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.5);
    line-height: 1.2;
  }

  .opt-btn.selected .opt-text-sub {
    color: rgba(255, 255, 255, 0.7);
  }

  /* ============= GUIDE TEXT ============= */
  .question-guide {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    margin-top: 6px;
    padding: 5px 8px;
    background: rgba(212, 185, 119, 0.05);
    border-left: 2px solid rgba(212, 185, 119, 0.4);
    border-radius: 3px;
    font-size: 8px;
    font-weight: 500;
    line-height: 1.4;
    color: rgba(255, 255, 255, 0.7);
  }

  .guide-icon {
    flex-shrink: 0;
    font-size: 12px;
  }

  /* Contact guide - simpler style */
  .contact-guide {
    background: transparent;
    border-left: none;
    padding: 4px 0 0 0;
    margin-top: 4px;
    font-size: 7.5px;
    color: rgba(255, 255, 255, 0.6);
    text-align: center;
  }

  /* ============= CONTACT SECTION (Not a question) ============= */
  .contact-section {
    margin-top: 10px;
    padding: 12px 12px;
    background: linear-gradient(135deg, rgba(212, 185, 119, 0.08) 0%, rgba(184, 157, 95, 0.04) 100%);
    border: 1px solid rgba(212, 185, 119, 0.25);
    border-radius: 8px;
    box-shadow: 
      0 0 0 1px rgba(212, 185, 119, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.03);
  }

  .contact-section-header {
    margin-bottom: 10px;
  }

  .contact-section-title {
    font-size: 12px;
    font-weight: 700;
    color: #FFFFFF;
    margin: 0 0 4px 0;
    line-height: 1.2;
    letter-spacing: -0.01em;
  }

  .contact-section-hint {
    font-size: 8px;
    font-weight: 500;
    color: rgba(212, 185, 119, 0.8);
    margin: 0;
    font-style: italic;
    line-height: 1.3;
  }

  .contact-section-content {
    /* Content styling handled by existing contact-tabs and compact-input */
  }

  .contact-privacy {
    margin-top: 6px;
    padding: 0;
    font-size: 7.5px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.6);
    text-align: center;
    line-height: 1.3;
  }

  /* ============= CONTACT TABS WITH RADIO ============= */
  .contact-tabs {
    display: flex;
    gap: 6px;
    margin-bottom: 8px;
  }

  .contact-tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 9px 6px;
    background: rgba(15, 15, 15, 0.5);
    border: 1.5px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    font-size: 9px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    font-family: inherit;
    position: relative;
  }

  .contact-tab:hover {
    background: rgba(20, 20, 20, 0.7);
    border-color: rgba(212, 185, 119, 0.3);
    color: rgba(255, 255, 255, 0.7);
    transform: translateY(-1px);
  }

  .contact-tab.active {
    background: linear-gradient(135deg, rgba(212, 185, 119, 0.2) 0%, rgba(184, 157, 95, 0.15) 100%);
    border-color: rgba(212, 185, 119, 0.6);
    color: #E8D4A0;
    box-shadow: 
      0 0 20px rgba(212, 185, 119, 0.2),
      inset 0 0 15px rgba(212, 185, 119, 0.1);
  }

  /* Radio circle */
  .contact-radio {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    background: rgba(0, 0, 0, 0.3);
  }

  .contact-tab:hover .contact-radio {
    border-color: rgba(212, 185, 119, 0.4);
  }

  .contact-tab.active .contact-radio {
    border-color: #D4B977;
    background: rgba(212, 185, 119, 0.15);
    box-shadow: 
      0 0 8px rgba(212, 185, 119, 0.4),
      inset 0 0 8px rgba(212, 185, 119, 0.2);
  }

  .radio-dot {
    width: 8px;
    height: 8px;
    background: linear-gradient(135deg, #E8D4A0 0%, #D4B977 100%);
    border-radius: 50%;
    box-shadow: 0 0 6px rgba(212, 185, 119, 0.8);
    animation: radioPulse 0.3s ease-out;
  }

  @keyframes radioPulse {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  /* Brand icons */
  .contact-icon {
    flex-shrink: 0;
    color: currentColor;
    transition: all 0.3s ease;
    opacity: 0.6;
  }

  .contact-tab:hover .contact-icon {
    opacity: 0.8;
    transform: scale(1.05);
  }

  .contact-tab.active .contact-icon {
    opacity: 1;
    filter: drop-shadow(0 0 8px rgba(212, 185, 119, 0.5));
  }

  .contact-icon-emoji {
    flex-shrink: 0;
    font-size: 16px;
    transition: all 0.3s ease;
    opacity: 0.6;
  }

  .contact-tab:hover .contact-icon-emoji {
    opacity: 0.8;
    transform: scale(1.05);
  }

  .contact-tab.active .contact-icon-emoji {
    opacity: 1;
    filter: drop-shadow(0 0 4px rgba(212, 185, 119, 0.4));
  }

  .contact-label {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.02em;
  }

  /* Contact block - special styling */
  .contact-block {
    background: linear-gradient(135deg, rgba(212, 185, 119, 0.03) 0%, rgba(184, 157, 95, 0.02) 100%);
    border-bottom-color: rgba(212, 185, 119, 0.25);
    padding: 10px 8px;
    border-radius: 6px;
  }

  /* ============= CONTACT SECTION ============= */
  .contact-tabs {
    display: flex;
    gap: 4px;
    background: rgba(212, 185, 119, 0.05);
    padding: 3px;
    border-radius: 5px;
    margin-bottom: 6px;
    border: 1px solid rgba(212, 185, 119, 0.15);
  }

  .contact-tab {
    flex: 1;
    padding: 6px 8px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 4px;
    font-size: 8px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.4);
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: inherit;
  }

  .contact-tab:hover {
    background: rgba(212, 185, 119, 0.05);
    color: rgba(255, 255, 255, 0.6);
  }

  .contact-tab.active {
    background: rgba(212, 185, 119, 0.15);
    border-color: rgba(212, 185, 119, 0.4);
    color: #E8D4A0;
  }

  .compact-input {
    width: 100%;
    padding: 7px 10px;
    background: transparent;
    border: 1px solid rgba(212, 185, 119, 0.3);
    border-radius: 5px;
    font-size: 10px;
    font-weight: 600;
    color: #FFFFFF;
    font-family: inherit;
    transition: all 0.3s ease;
    margin-bottom: 6px;
  }

  .compact-input::placeholder {
    color: rgba(255, 255, 255, 0.3);
    font-weight: 500;
  }

  .compact-input:focus {
    outline: none;
    border-color: rgba(212, 185, 119, 0.6);
    background: rgba(212, 185, 119, 0.05);
    box-shadow: 0 0 0 2px rgba(212, 185, 119, 0.15);
  }

  /* ============= TEXTAREA ============= */
  .compact-textarea {
    width: 100%;
    padding: 7px 10px;
    background: transparent;
    border: 1px solid rgba(212, 185, 119, 0.3);
    border-radius: 5px;
    font-size: 9px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
    font-family: inherit;
    line-height: 1.4;
    resize: none;
    transition: all 0.3s ease;
    margin-bottom: 6px;
  }

  .compact-textarea::placeholder {
    color: rgba(255, 255, 255, 0.3);
    font-style: italic;
  }

  .compact-textarea:focus {
    outline: none;
    border-color: rgba(212, 185, 119, 0.6);
    background: rgba(212, 185, 119, 0.05);
    box-shadow: 0 0 0 2px rgba(212, 185, 119, 0.15);
  }

  /* ============= ERROR ============= */
  .error {
    margin-top: 4px;
    padding: 4px 8px;
    background: rgba(220, 38, 38, 0.1);
    border: 1px solid rgba(220, 38, 38, 0.3);
    border-radius: 4px;
    font-size: 8px;
    font-weight: 600;
    color: #FCA5A5;
  }

  /* ============= FOOTER ============= */
  .form-footer {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 6px 0;
    margin-top: 6px;
  }

  .footer-note {
    padding: 6px 8px;
    border-radius: 4px;
    font-size: 8px;
    font-weight: 600;
    line-height: 1.3;
    margin: 0;
  }

  .footer-note.primary {
    background: linear-gradient(135deg, rgba(212, 185, 119, 0.12) 0%, rgba(184, 157, 95, 0.08) 100%);
    border: 1px solid rgba(212, 185, 119, 0.3);
    color: #E8D4A0;
  }

  .footer-note:not(.primary) {
    background: rgba(20, 20, 20, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.5);
  }

  /* ============= SUBMIT BUTTON ============= */
  .compact-submit {
    width: 100%;
    height: 38px;
    position: relative;
    font-family: inherit;
    cursor: pointer;
    border: none;
    border-radius: 6px;
    overflow: hidden;
    margin-top: 4px;
    
    background: linear-gradient(135deg, #1A1814 0%, #534838 30%, #B8A160 50%, #534838 70%, #1A1814 100%);
    
    box-shadow: 
      0 0 0 1px rgba(184, 161, 96, 0.4),
      0 0 20px rgba(184, 161, 96, 0.2),
      0 4px 12px rgba(0, 0, 0, 0.5);
    
    font-size: 8px;
    font-weight: 900;
    letter-spacing: 0.1em;
    color: #FFFFFF;
    text-shadow: 0 0 12px rgba(255, 255, 255, 0.4), 0 2px 4px rgba(0, 0, 0, 0.8);
    
    transition: all 0.3s ease;
  }

  .compact-submit:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 
      0 0 0 1px rgba(200, 177, 111, 0.6),
      0 0 30px rgba(212, 185, 119, 0.3),
      0 6px 16px rgba(0, 0, 0, 0.6);
  }

  .compact-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* ============= SUCCESS STATE ============= */
  .compact-success {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 40px 20px;
    text-align: center;
  }

  .success-icon {
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(212, 185, 119, 0.2) 0%, rgba(184, 157, 95, 0.15) 100%);
    border: 2px solid rgba(212, 185, 119, 0.4);
    border-radius: 50%;
    font-size: 32px;
    color: #E8D4A0;
    margin-bottom: 20px;
  }

  .success-title {
    font-size: 20px;
    font-weight: 900;
    letter-spacing: 0.05em;
    color: #E8D4A0;
    margin: 0 0 12px 0;
  }

  .success-text {
    font-size: 13px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
  }

  /* ============= DESKTOP ============= */
  @media (min-width: 768px) {
    .compact-form-inner {
      max-width: 680px;
      padding: 16px 20px 20px;
      gap: 12px;
    }

    .compact-header {
      padding: 8px 0 12px;
    }

    .header-badge {
      font-size: 9px;
      padding: 4px 14px;
      margin-bottom: 12px;
    }

    .compact-title {
      font-size: 24px;
      margin-bottom: 10px;
    }

    .compact-subtitle {
      font-size: 13px;
    }

    .block-num {
      width: 32px;
      height: 32px;
      font-size: 14px;
    }

    .block-title {
      font-size: 15px;
      margin-bottom: 4px;
    }

    .block-hint {
      font-size: 10px;
    }

    .opt-btn {
      padding: 10px 12px;
      gap: 12px;
    }

    .opt-icon {
      font-size: 18px;
      width: 24px;
    }

    .opt-text {
      font-size: 12px;
    }

    .opt-check, .opt-radio {
      width: 20px;
      height: 20px;
    }

    .question-guide {
      font-size: 11px;
      padding: 10px 12px;
    }

    .compact-input, .compact-textarea {
      font-size: 13px;
      padding: 12px 14px;
    }

    .compact-submit {
      height: 52px;
      font-size: 11px;
    }

    .contact-section {
      padding: 20px 18px;
    }

    .contact-section-title {
      font-size: 16px;
      margin-bottom: 6px;
    }

    .contact-section-hint {
      font-size: 11px;
    }

    .contact-privacy {
      font-size: 10px;
    }

    .contact-tab {
      padding: 12px 10px;
      gap: 8px;
    }

    .contact-radio {
      width: 18px;
      height: 18px;
    }

    .radio-dot {
      width: 9px;
      height: 9px;
    }

    .contact-icon {
      width: 20px;
      height: 20px;
    }

    .contact-icon-emoji {
      font-size: 18px;
    }

    .contact-label {
      font-size: 11px;
    }
  }
`;