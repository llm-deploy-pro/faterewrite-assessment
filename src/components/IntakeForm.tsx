// src/components/IntakeForm.tsx
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
  console.log(`[Track] Event ${key} first trigger`);
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
  q2_city: string;
  q2_city_custom: string;
  q3_budget: string;
  q4_priority: string;
  q5_contact_method: string;
  q5_contact_value: string;
}

const Q1_OPTIONS = [
  { id: "conversation", text: "A conversation that doesn't feel like work", icon: "💋" },
  { id: "meet", text: "To meet someone real, in person, this week", icon: "🌹" },
  { id: "ongoing", text: "Something ongoing that doesn't disappear", icon: "💫" }
];

const Q2_CITIES = [
  "New York",
  "Los Angeles", 
  "Chicago",
  "Miami",
  "San Francisco",
  "Dallas",
  "Boston",
  "Seattle",
  "Atlanta",
  "Other major city",
  "I'll travel to you"
];

const Q3_OPTIONS = [
  { id: "exploring", text: "I'm exploring, but serious", range: "a few hundred", level: "ENTRY" },
  { id: "know", text: "I know what I want", range: "up to a couple thousand", level: "SELECT" },
  { id: "priority", text: "I want priority and flexibility", range: "I'll invest what it takes", level: "PREMIUM" }
];

const Q4_OPTIONS = [
  { id: "discretion", text: "Total discretion — no one can know about this", icon: "🤫" },
  { id: "proof", text: "Proof I'm real — verified photo before we meet", icon: "💎" },
  { id: "respect", text: "Respect for time — if we set it, it happens", icon: "🎀" }
];

export default function IntakeForm() {
  const hasTrackedRef = useRef(false);
  const timeTrackingRef = useRef({ t3: false, t10: false, t20: false });
  const pageLoadTimeRef = useRef(Date.now());
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [showValidationToast, setShowValidationToast] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  
  const [formData, setFormData] = useState<FormData>({
    q1_scenarios: [],
    q2_city: "",
    q2_city_custom: "",
    q3_budget: "",
    q4_priority: "",
    q5_contact_method: "",
    q5_contact_value: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  const trackEvent = (eventName: string, extraData: Record<string, any> = {}) => {
    const frid = ensureFrid();
    const isDev = window.location.hostname === "localhost";
    
    if (markOnce(eventName, isDev)) {
      if (typeof (window as any).fbq !== "undefined") {
        const eventId = "ev_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        (window as any).fbq("trackCustom", eventName, {
          user_id: frid,
          timestamp: new Date().toISOString(),
          ...extraData
        }, { eventID: eventId });
      }
      console.log(`[Event Tracked] ${eventName}`, extraData);
    }
  };

  useEffect(() => {
    const checkTimeTracking = () => {
      const elapsed = (Date.now() - pageLoadTimeRef.current) / 1000;
      
      if (elapsed >= 3 && !timeTrackingRef.current.t3) {
        timeTrackingRef.current.t3 = true;
        trackEvent("form_time_3s", { elapsed_seconds: 3 });
      }
      
      if (elapsed >= 10 && !timeTrackingRef.current.t10) {
        timeTrackingRef.current.t10 = true;
        trackEvent("form_time_10s", { elapsed_seconds: 10 });
      }
      
      if (elapsed >= 20 && !timeTrackingRef.current.t20) {
        timeTrackingRef.current.t20 = true;
        trackEvent("form_time_20s", { elapsed_seconds: 20 });
      }
    };

    const interval = setInterval(checkTimeTracking, 500);
    return () => clearInterval(interval);
  }, []);

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

  const handleQuestionClick = (questionId: string) => {
    trackEvent(`question_${questionId}_clicked`, { question: questionId });
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };

  const handleContactMethodSelect = (method: string) => {
    trackEvent("contact_method_selected", { method });
    setFormData(p => ({ ...p, q5_contact_method: method }));
  };

  const showElegantToast = () => {
    const progress = {
      total: 5,
      completed: 0,
      missing: [] as string[]
    };

    if (formData.q1_scenarios.length > 0) progress.completed++;
    else progress.missing.push("Question 1");

    const isCityValid = formData.q2_city && 
      (formData.q2_city !== "Other major city" || formData.q2_city_custom.trim());
    
    if (isCityValid) progress.completed++;
    else progress.missing.push("Question 2");

    if (formData.q3_budget) progress.completed++;
    else progress.missing.push("Question 3");

    if (formData.q4_priority) progress.completed++;
    else progress.missing.push("Question 4");

    if (formData.q5_contact_method && formData.q5_contact_value.trim()) progress.completed++;
    else progress.missing.push("Contact Information");

    setValidationMessage(JSON.stringify(progress));
    setShowValidationToast(true);
    setTimeout(() => {
      setShowValidationToast(false);
    }, 4000);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (formData.q1_scenarios.length === 0) {
      newErrors.q1 = "Please select at least one option";
      showElegantToast();
      return false;
    }
    
    if (!formData.q2_city) {
      newErrors.q2 = "Please select your city";
      showElegantToast();
      return false;
    }
    
    if (formData.q2_city === "Other major city" && !formData.q2_city_custom.trim()) {
      newErrors.q2_custom = "Please enter your city name";
      showElegantToast();
      return false;
    }
    
    if (!formData.q3_budget) {
      newErrors.q3 = "Please select an option";
      showElegantToast();
      return false;
    }
    
    if (!formData.q4_priority) {
      newErrors.q4 = "Please select an option";
      showElegantToast();
      return false;
    }
    
    if (!formData.q5_contact_method) {
      newErrors.q5 = "Please select a contact method";
      showElegantToast();
      return false;
    }
    
    if (!formData.q5_contact_value.trim()) {
      newErrors.q5 = "Please provide your contact information";
      showElegantToast();
      return false;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    trackEvent("cta_clicked", { 
      form_complete: validateForm(),
      q1_filled: formData.q1_scenarios.length > 0,
      q2_filled: !!formData.q2_city,
      q2_custom_filled: formData.q2_city === "Other major city" ? !!formData.q2_city_custom : true,
      q3_filled: !!formData.q3_budget,
      q4_filled: !!formData.q4_priority,
      contact_filled: !!(formData.q5_contact_method && formData.q5_contact_value)
    });
    
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
      
      setIsSubmitting(false);
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error("Submission error:", error);
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
  };

  const getContactMethodDisplay = () => {
    const method = formData.q5_contact_method;
    if (method === 'whatsapp') return 'WhatsApp';
    if (method === 'telegram') return 'Telegram';
    if (method === 'email') return 'Email';
    return 'your contact method';
  };

  return (
    <div className="compact-form-container">
      <div className={`compact-form-inner ${expandedQuestion ? 'compact-mode' : 'relaxed-mode'}`}>
        
        {showValidationToast && (() => {
          const progress = JSON.parse(validationMessage);
          const missingCount = progress.missing.length;
          return (
            <div className="validation-banner">
              <div className="banner-content">
                <div className="banner-icon">⚠</div>
                <div className="banner-text">
                  <p className="banner-title">Please complete all questions</p>
                  <p className="banner-subtitle">{missingCount} question{missingCount > 1 ? 's' : ''} remaining • {progress.completed} of {progress.total} completed</p>
                </div>
                <button 
                  className="banner-close"
                  onClick={() => setShowValidationToast(false)}
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })()}
        
        <header className="compact-header">
          <div className="header-badge">🔒 PRIVATE INTAKE</div>
          <h1 className="compact-title">Before I decide if this week works.</h1>
          <p className="compact-subtitle">Four questions. Answer honestly—I can tell when you're not.</p>
          
          <div className="pre-form-guide">
            <p className="guide-main">I have 3 openings left this week.</p>
            <p className="guide-sub">If we match, I'll send you a recent photo and we can discuss when.</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="compact-form">
          
          <div className="form-block" id="question-q1">
            <button
              type="button"
              className="block-header-btn"
              onClick={() => handleQuestionClick("q1")}
            >
              <span className="block-num">01</span>
              <div className="block-header-text">
                <h3 className="block-title">What are you actually looking for with me?</h3>
                <p className="block-hint">Don't tell me what you think I want to hear. Tell me the truth.</p>
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

          <div className="form-block" id="question-q2">
            <button
              type="button"
              className="block-header-btn"
              onClick={() => handleQuestionClick("q2")}
            >
              <span className="block-num">02</span>
              <div className="block-header-text">
                <h3 className="block-title">Where are you based?</h3>
                <p className="block-hint">I only connect with people in major metros or those willing to travel.</p>
              </div>
              <span className={`expand-icon ${expandedQuestion === "q2" ? "expanded" : ""}`}>›</span>
            </button>
            {expandedQuestion === "q2" && (
              <div className="options-list">
                <select
                  className="compact-select"
                  value={formData.q2_city}
                  onChange={(e) => {
                    setTouchedFields(p => ({ ...p, q2: true }));
                    setFormData(p => ({ ...p, q2_city: e.target.value }));
                  }}
                >
                  <option value="">Select your city ▼</option>
                  {Q2_CITIES.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {errors.q2 && touchedFields.q2 && <div className="error">{errors.q2}</div>}
                
                {formData.q2_city === "Other major city" && (
                  <div className="city-custom-wrapper">
                    <input
                      type="text"
                      className="compact-input city-custom-input"
                      placeholder="Enter your city name"
                      value={formData.q2_city_custom}
                      onChange={(e) => {
                        setTouchedFields(p => ({ ...p, q2_custom: true }));
                        setFormData(p => ({ ...p, q2_city_custom: e.target.value }));
                      }}
                    />
                    {errors.q2_custom && touchedFields.q2_custom && <div className="error">{errors.q2_custom}</div>}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="form-block" id="question-q3">
            <button
              type="button"
              className="block-header-btn"
              onClick={() => handleQuestionClick("q3")}
            >
              <span className="block-num">03</span>
              <div className="block-header-text">
                <h3 className="block-title">My time isn't free. What can you invest?</h3>
                <p className="block-hint">Be honest. There's no wrong answer—just different levels of access.</p>
              </div>
              <span className={`expand-icon ${expandedQuestion === "q3" ? "expanded" : ""}`}>›</span>
            </button>
            {expandedQuestion === "q3" && (
              <div className="options-list">
                {Q3_OPTIONS.map((opt) => {
                  const isSelected = formData.q3_budget === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className={`opt-btn budget ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        setTouchedFields(p => ({ ...p, q3: true }));
                        setFormData(p => ({ ...p, q3_budget: opt.id }));
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
                {errors.q3 && touchedFields.q3 && <div className="error">{errors.q3}</div>}
              </div>
            )}
          </div>

          <div className="form-block" id="question-q4">
            <button
              type="button"
              className="block-header-btn"
              onClick={() => handleQuestionClick("q4")}
            >
              <span className="block-num">04</span>
              <div className="block-header-text">
                <h3 className="block-title">What matters most to you for this to work?</h3>
                <p className="block-hint">This is my filter. Choose what you actually need, not what sounds good.</p>
              </div>
              <span className={`expand-icon ${expandedQuestion === "q4" ? "expanded" : ""}`}>›</span>
            </button>
            {expandedQuestion === "q4" && (
              <div className="options-list">
                {Q4_OPTIONS.map((opt) => {
                  const isSelected = formData.q4_priority === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className={`opt-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        setTouchedFields(p => ({ ...p, q4: true }));
                        setFormData(p => ({ ...p, q4_priority: opt.id }));
                      }}
                    >
                      <span className="opt-icon">{opt.icon}</span>
                      <span className="opt-text">{opt.text}</span>
                      <span className="opt-radio">{isSelected && '●'}</span>
                    </button>
                  );
                })}
                {errors.q4 && touchedFields.q4 && <div className="error">{errors.q4}</div>}
              </div>
            )}
          </div>

          <div className="contact-section">
            <div className="contact-section-header">
              <h3 className="contact-section-title">If we're a match, where should I reach you?</h3>
              <p className="contact-section-hint">🔒 End-to-end encrypted. This stays between you and me.</p>
            </div>
            <div className="contact-section-content">
              <div className="contact-tabs">
                <button
                  type="button"
                  className={`contact-tab ${formData.q5_contact_method === 'whatsapp' ? 'active' : ''}`}
                  onClick={() => handleContactMethodSelect('whatsapp')}
                >
                  <span className="contact-radio">
                    {formData.q5_contact_method === 'whatsapp' && <span className="radio-heart">♥</span>}
                  </span>
                  <svg className="contact-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="currentColor"/>
                  </svg>
                  <span className="contact-label">WhatsApp</span>
                </button>

                <button
                  type="button"
                  className={`contact-tab ${formData.q5_contact_method === 'telegram' ? 'active' : ''}`}
                  onClick={() => handleContactMethodSelect('telegram')}
                >
                  <span className="contact-radio">
                    {formData.q5_contact_method === 'telegram' && <span className="radio-heart">♥</span>}
                  </span>
                  <svg className="contact-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.68c.223-.198-.054-.308-.346-.11l-6.4 4.03-2.76-.918c-.6-.187-.612-.6.125-.89l10.782-4.156c.5-.18.943.11.78.89z" fill="currentColor"/>
                  </svg>
                  <span className="contact-label">Telegram</span>
                </button>

                <button
                  type="button"
                  className={`contact-tab ${formData.q5_contact_method === 'email' ? 'active' : ''}`}
                  onClick={() => handleContactMethodSelect('email')}
                >
                  <span className="contact-radio">
                    {formData.q5_contact_method === 'email' && <span className="radio-heart">♥</span>}
                  </span>
                  <span className="contact-icon-emoji">📧</span>
                  <span className="contact-label">Email</span>
                </button>
              </div>
              <input
                type="text"
                className="compact-input"
                placeholder="your@private.contact"
                value={formData.q5_contact_value}
                onChange={(e) => {
                  setTouchedFields(p => ({ ...p, q5: true }));
                  setFormData(p => ({ ...p, q5_contact_value: e.target.value }));
                }}
              />
              {errors.q5 && touchedFields.q5 && <div className="error">{errors.q5}</div>}
            </div>
          </div>

          <div className="form-footer">
            <p className="footer-note">I review every request personally. Most don't make the cut. If you're a match, you'll hear from me within 2-24 hours.</p>
          </div>

          <button type="submit" className="compact-submit" disabled={isSubmitting}>
            {isSubmitting ? "PROCESSING..." : "SUBMIT FOR MY REVIEW"}
          </button>

        </form>
      </div>

      {showSuccessModal && (
        <div className="success-modal-overlay">
          <div className="success-modal-card">
            <div className="success-icon-wrapper">
              <div className="success-icon">✨</div>
            </div>
            <h2 className="success-title">Your request is with me now.</h2>
            <p className="success-subtitle">
              If we're a match, you'll hear from me within 2-24 hours.
            </p>
            <p className="success-hint">
              Check your <strong>{getContactMethodDisplay()}</strong> — I only reach out once.
            </p>
            <button className="success-cta" onClick={handleModalClose}>
              UNDERSTOOD
            </button>
            <div className="countdown-ring">
              <svg className="countdown-svg" viewBox="0 0 36 36">
                <path
                  className="countdown-bg"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="countdown-progress"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            </div>
          </div>
        </div>
      )}

      <style>{`
  :root {
    --gold-primary: #b8965f;
    --gold-bright: #d4af37;
    --gold-light: #f0c850;
    --cream: #e8e8e0;
    --bg-dark: #0a0c12;
    --bg-secondary: #12151c;
    --bg-card: #0f1218;
  }

  * {
    -webkit-tap-highlight-color: transparent;
  }

  .compact-form-container {
    position: relative;
    width: 100%;
    min-height: 100vh;
    background: var(--bg-dark);
    isolation: isolate;
    overflow-y: auto;
    overflow-x: hidden;
    padding-bottom: 40px;
  }

  .compact-form-container::before {
    content: "";
    position: fixed;
    inset: 0;
    z-index: 0;
    background: 
      radial-gradient(ellipse at 50% 20%, rgba(30, 22, 15, 0.8) 0%, transparent 50%),
      radial-gradient(circle at 30% 40%, rgba(184, 150, 95, 0.05) 0%, transparent 40%),
      radial-gradient(circle at 70% 60%, rgba(212, 175, 55, 0.03) 0%, transparent 35%),
      radial-gradient(ellipse at 50% 80%, rgba(10, 12, 18, 1) 0%, rgba(5, 6, 10, 1) 100%);
  }

  .compact-form-container::after {
    content: "";
    position: fixed;
    inset: 0;
    z-index: 1;
    background: 
      radial-gradient(circle at 30% 20%, rgba(184, 150, 95, 0.02) 0%, transparent 30%),
      radial-gradient(circle at 70% 80%, rgba(212, 175, 55, 0.015) 0%, transparent 25%);
    pointer-events: none;
    opacity: 0.8;
    animation: ambientFloat 20s ease-in-out infinite;
  }

  @keyframes ambientFloat {
    0%, 100% { opacity: 0.6; transform: translate(0, 0); }
    50% { opacity: 0.8; transform: translate(10px, 10px); }
  }

  .validation-banner {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 9999;
    padding: 12px 16px;
    background: linear-gradient(135deg, rgba(184, 150, 95, 0.95) 0%, rgba(140, 115, 75, 0.95) 100%);
    border-bottom: 2px solid var(--gold-primary);
    box-shadow: 
      0 4px 24px rgba(184, 150, 95, 0.3),
      0 0 0 1px rgba(255, 255, 255, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(12px);
    animation: bannerSlideDown 400ms cubic-bezier(0.23, 1, 0.32, 1);
  }

  @keyframes bannerSlideDown {
    from {
      opacity: 0;
      transform: translateY(-100%);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .banner-content {
    max-width: 420px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .banner-icon {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(26, 24, 20, 0.2);
    border: 1px solid rgba(26, 24, 20, 0.3);
    border-radius: 50%;
    font-size: 16px;
    color: #1A1814;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .banner-text {
    flex: 1;
    min-width: 0;
  }

  .banner-title {
    margin: 0 0 2px 0;
    font-size: 13px;
    font-weight: 700;
    color: #1A1814;
    letter-spacing: 0.01em;
    line-height: 1.2;
  }

  .banner-subtitle {
    margin: 0;
    font-size: 10px;
    font-weight: 600;
    color: rgba(26, 24, 20, 0.7);
    letter-spacing: 0.01em;
    line-height: 1.3;
  }

  .banner-close {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid rgba(26, 24, 20, 0.2);
    border-radius: 50%;
    font-family: inherit;
    font-size: 14px;
    font-weight: 400;
    color: #1A1814;
    cursor: pointer;
    transition: all 200ms ease;
  }

  .banner-close:hover {
    background: rgba(26, 24, 20, 0.1);
    border-color: rgba(26, 24, 20, 0.3);
    transform: scale(1.05);
  }

  .banner-close:active {
    transform: scale(0.95);
  }

  .compact-form-inner {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 420px;
    margin: 0 auto;
    padding: 8px 12px 12px;
    display: flex;
    flex-direction: column;
    transition: gap 400ms cubic-bezier(0.23, 1, 0.32, 1);
  }

  .compact-form-inner.relaxed-mode {
    gap: 14px;
  }

  .compact-form-inner.compact-mode {
    gap: 6px;
  }

  .compact-header {
    text-align: center;
    transition: padding 400ms cubic-bezier(0.23, 1, 0.32, 1);
  }

  .relaxed-mode .compact-header {
    padding: 10px 0 12px;
  }

  .compact-mode .compact-header {
    padding: 4px 0 6px;
  }

  .header-badge {
    display: inline-block;
    padding: 7px 24px;
    background: rgba(0, 0, 0, 0.8);
    border: 1px solid rgba(184, 150, 95, 0.3);
    border-radius: 20px;
    backdrop-filter: blur(16px) saturate(180%);
    font-size: 7.5px;
    font-weight: 700;
    letter-spacing: 0.15em;
    color: rgba(184, 150, 95, 0.95);
    margin-bottom: 8px;
    box-shadow: 
      0 2px 12px rgba(0, 0, 0, 0.5),
      0 0 24px rgba(184, 150, 95, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    animation: badgeBreath 4s ease-in-out infinite;
  }

  @keyframes badgeBreath {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
  }

  .compact-title {
    font-size: 16px;
    font-weight: 700;
    line-height: 1.25;
    color: var(--cream);
    margin: 0 0 6px 0;
    letter-spacing: -0.01em;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .compact-subtitle {
    font-size: 10px;
    font-weight: 500;
    line-height: 1.3;
    color: rgba(232, 232, 224, 0.6);
    margin: 0;
    font-style: italic;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .pre-form-guide {
    padding: 10px 12px;
    background: linear-gradient(135deg, rgba(18, 21, 28, 0.7) 0%, rgba(12, 15, 20, 0.8) 100%);
    border: 1px solid rgba(184, 150, 95, 0.3);
    border-radius: 8px;
    text-align: center;
    transition: margin 400ms cubic-bezier(0.23, 1, 0.32, 1);
    backdrop-filter: blur(20px) saturate(150%);
    box-shadow: 
      0 4px 20px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(255, 255, 255, 0.05),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }

  .relaxed-mode .pre-form-guide {
    margin: 12px 0;
  }

  .compact-mode .pre-form-guide {
    margin: 8px 0;
  }

  .guide-main {
    font-size: 10px;
    font-weight: 700;
    color: rgba(232, 232, 224, 0.95);
    margin: 0 0 4px 0;
    line-height: 1.3;
    letter-spacing: 0.01em;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .guide-sub {
    font-size: 8px;
    font-weight: 500;
    color: rgba(184, 150, 95, 0.85);
    margin: 0;
    line-height: 1.4;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .compact-form {
    display: flex;
    flex-direction: column;
    transition: gap 400ms cubic-bezier(0.23, 1, 0.32, 1);
  }

  .relaxed-mode .compact-form {
    gap: 8px;
  }

  .compact-mode .compact-form {
    gap: 3px;
  }

  .form-block {
    position: relative;
    border-bottom: 1px solid rgba(184, 150, 95, 0.12);
  }

  .form-block::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(184, 150, 95, 0.4) 50%,
      transparent 100%
    );
    opacity: 0;
    transition: opacity 400ms ease;
  }

  .form-block:hover::after {
    opacity: 1;
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
    transition: all 400ms cubic-bezier(0.23, 1, 0.32, 1);
    font-family: inherit;
    text-align: left;
  }

  .block-header-btn:hover {
    background: rgba(184, 150, 95, 0.06);
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
    background: linear-gradient(135deg, rgba(184, 150, 95, 0.25) 0%, rgba(140, 115, 75, 0.2) 100%);
    border: 1px solid rgba(184, 150, 95, 0.4);
    border-radius: 5px;
    font-size: 11px;
    font-weight: 800;
    color: var(--cream);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .block-title {
    font-size: 11px;
    font-weight: 700;
    color: var(--cream);
    margin: 0 0 2px 0;
    line-height: 1.2;
    letter-spacing: -0.01em;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .block-hint {
    font-size: 7.5px;
    font-weight: 400;
    color: rgba(232, 232, 224, 0.45);
    margin: 0;
    font-style: italic;
    line-height: 1.3;
    letter-spacing: 0.01em;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .expand-icon {
    flex-shrink: 0;
    font-size: 20px;
    color: rgba(184, 150, 95, 0.6);
    transition: transform 400ms cubic-bezier(0.23, 1, 0.32, 1);
    transform: rotate(0deg);
    line-height: 1;
  }

  .expand-icon.expanded {
    transform: rotate(90deg);
  }

  .options-list {
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: 0 8px 8px 42px;
    animation: slideDown 400ms cubic-bezier(0.23, 1, 0.32, 1);
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

  .opt-btn {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 8px;
    background: rgba(18, 21, 28, 0.4);
    border: 1px solid rgba(184, 150, 95, 0.25);
    border-radius: 5px;
    cursor: pointer;
    transition: all 400ms cubic-bezier(0.23, 1, 0.32, 1);
    text-align: left;
    font-family: inherit;
    color: inherit;
    backdrop-filter: blur(10px);
  }

  .opt-btn:hover {
    transform: translateY(-1px);
    border-color: rgba(184, 150, 95, 0.5);
    background: rgba(18, 21, 28, 0.7);
    box-shadow: 
      0 4px 16px rgba(0, 0, 0, 0.3),
      0 0 20px rgba(184, 150, 95, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }

  .opt-btn.selected {
    border-color: rgba(184, 150, 95, 0.7);
    background: linear-gradient(135deg, rgba(184, 150, 95, 0.15) 0%, rgba(140, 115, 75, 0.1) 100%);
    box-shadow: 
      0 0 0 1px rgba(184, 150, 95, 0.4),
      0 4px 20px rgba(184, 150, 95, 0.2),
      inset 0 0 20px rgba(184, 150, 95, 0.1);
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
    font-weight: 500;
    color: rgba(232, 232, 224, 0.85);
    line-height: 1.3;
    letter-spacing: 0em;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .opt-btn.selected .opt-text {
    color: var(--cream);
    font-weight: 600;
  }

  .opt-check {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    color: #000000;
    background: transparent;
    transition: all 400ms cubic-bezier(0.23, 1, 0.32, 1);
  }

  .opt-btn.selected .opt-check {
    background: linear-gradient(135deg, var(--gold-bright) 0%, var(--gold-primary) 100%);
    border-color: var(--gold-bright);
    box-shadow: 
      0 0 12px rgba(212, 175, 55, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }

  .opt-radio {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 8px;
    color: var(--gold-primary);
    transition: all 400ms cubic-bezier(0.23, 1, 0.32, 1);
  }

  .opt-btn.selected .opt-radio {
    border-color: var(--gold-bright);
    background: radial-gradient(circle, rgba(212, 175, 55, 0.2) 0%, transparent 70%);
    box-shadow: 0 0 12px rgba(212, 175, 55, 0.3);
  }

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
    color: rgba(232, 232, 224, 0.9);
    line-height: 1.2;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .opt-btn.selected .opt-text-main {
    color: var(--cream);
  }

  .opt-text-sub {
    font-size: 8px;
    font-weight: 500;
    color: rgba(232, 232, 224, 0.5);
    line-height: 1.2;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .opt-btn.selected .opt-text-sub {
    color: rgba(232, 232, 224, 0.75);
  }

  .compact-select {
    width: 100%;
    padding: 7px 10px;
    background: rgba(18, 21, 28, 0.7);
    border: 1px solid rgba(184, 150, 95, 0.35);
    border-radius: 5px;
    font-size: 10px;
    font-weight: 600;
    color: var(--cream);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    transition: all 400ms cubic-bezier(0.23, 1, 0.32, 1);
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23b8965f' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    padding-right: 35px;
    backdrop-filter: blur(20px) saturate(150%);
    box-shadow: 
      0 2px 8px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.03);
  }

  .compact-select option {
    background: #0f1218;
    color: var(--cream);
    padding: 12px 16px;
    font-weight: 500;
  }

  .compact-select:focus {
    outline: none;
    background: rgba(18, 21, 28, 0.9);
    border-color: rgba(184, 150, 95, 0.6);
    box-shadow: 
      0 0 0 3px rgba(184, 150, 95, 0.2),
      0 4px 20px rgba(184, 150, 95, 0.2);
  }

  .city-custom-wrapper {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid rgba(184, 150, 95, 0.15);
    animation: slideDown 400ms cubic-bezier(0.23, 1, 0.32, 1);
  }

  .city-custom-input {
    margin-bottom: 0;
  }

  .contact-section {
    margin-top: 10px;
    padding: 12px 12px;
    background: linear-gradient(135deg, rgba(18, 21, 28, 0.8) 0%, rgba(12, 15, 20, 0.9) 100%);
    border: 1px solid rgba(184, 150, 95, 0.3);
    border-radius: 8px;
    position: relative;
    backdrop-filter: blur(20px) saturate(150%);
    box-shadow: 
      0 0 0 1px rgba(184, 150, 95, 0.2),
      0 8px 32px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }

  .contact-section::before {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: 9px;
    background: linear-gradient(135deg,
      rgba(184, 150, 95, 0.2) 0%,
      transparent 50%,
      rgba(184, 150, 95, 0.15) 100%
    );
    opacity: 0.5;
    pointer-events: none;
  }

  .contact-section-header {
    margin-bottom: 10px;
  }

  .contact-section-title {
    font-size: 12px;
    font-weight: 700;
    color: var(--cream);
    margin: 0 0 4px 0;
    line-height: 1.2;
    letter-spacing: -0.01em;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .contact-section-hint {
    font-size: 8px;
    font-weight: 500;
    color: rgba(184, 150, 95, 0.85);
    margin: 0;
    font-style: italic;
    line-height: 1.3;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

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
    background: rgba(15, 15, 15, 0.6);
    border: none;
    border-radius: 6px;
    font-size: 9px;
    font-weight: 600;
    color: rgba(232, 232, 224, 0.5);
    cursor: pointer;
    transition: all 400ms cubic-bezier(0.23, 1, 0.32, 1);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    position: relative;
  }

  .contact-tab:hover {
    background: rgba(20, 20, 20, 0.8);
    color: rgba(232, 232, 224, 0.75);
    transform: translateY(-1px);
    box-shadow: 
      0 0 0 1px rgba(184, 150, 95, 0.25),
      0 2px 12px rgba(0, 0, 0, 0.25);
  }

  .contact-tab.active {
    background: transparent;
    color: var(--cream);
    border: none;
    box-shadow: 
      0 0 0 1px rgba(184, 150, 95, 0.4),
      0 0 24px rgba(184, 150, 95, 0.2),
      inset 0 0 24px rgba(184, 150, 95, 0.1);
  }

  .contact-radio {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 400ms cubic-bezier(0.23, 1, 0.32, 1);
    background: rgba(0, 0, 0, 0.3);
  }

  .contact-tab:hover .contact-radio {
    border-color: rgba(184, 150, 95, 0.5);
  }

  .contact-tab.active .contact-radio {
    border-color: var(--gold-bright);
    background: radial-gradient(circle,
      rgba(212, 175, 55, 0.25) 0%,
      transparent 70%
    );
    box-shadow: 
      0 0 0 1px rgba(212, 175, 55, 0.5),
      0 0 20px rgba(212, 175, 55, 0.5),
      inset 0 0 16px rgba(212, 175, 55, 0.25);
  }

  .radio-heart {
    font-size: 12px;
    color: var(--gold-bright);
    animation: heartPulse 500ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
    filter: drop-shadow(0 0 10px rgba(212, 175, 55, 0.9));
    text-shadow: 0 0 16px rgba(212, 175, 55, 0.8);
  }

  @keyframes heartPulse {
    0% {
      transform: scale(0) rotate(-15deg);
      opacity: 0;
    }
    50% {
      transform: scale(1.4) rotate(5deg);
    }
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
  }

  .contact-icon {
    flex-shrink: 0;
    color: currentColor;
    transition: all 400ms cubic-bezier(0.23, 1, 0.32, 1);
    opacity: 0.6;
  }

  .contact-tab:hover .contact-icon {
    opacity: 0.85;
    transform: scale(1.1);
  }

  .contact-tab.active .contact-icon {
    opacity: 1;
    filter: drop-shadow(0 0 10px rgba(184, 150, 95, 0.6));
  }

  .contact-icon-emoji {
    flex-shrink: 0;
    font-size: 16px;
    transition: all 400ms cubic-bezier(0.23, 1, 0.32, 1);
    opacity: 0.6;
  }

  .contact-tab:hover .contact-icon-emoji {
    opacity: 0.85;
    transform: scale(1.1);
  }

  .contact-tab.active .contact-icon-emoji {
    opacity: 1;
    filter: drop-shadow(0 0 6px rgba(184, 150, 95, 0.5));
  }

  .contact-label {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.02em;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .compact-input {
    width: 100%;
    padding: 7px 10px;
    background: rgba(18, 21, 28, 0.6);
    border: 1px solid rgba(184, 150, 95, 0.35);
    border-radius: 5px;
    font-size: 10px;
    font-weight: 600;
    color: var(--cream);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    transition: all 400ms cubic-bezier(0.23, 1, 0.32, 1);
    margin-bottom: 6px;
    backdrop-filter: blur(10px);
  }

  .compact-input::placeholder {
    color: rgba(232, 232, 224, 0.3);
    font-weight: 500;
  }

  .compact-input:focus {
    outline: none;
    border-color: rgba(184, 150, 95, 0.7);
    background: rgba(18, 21, 28, 0.8);
    box-shadow: 
      0 0 0 3px rgba(184, 150, 95, 0.2),
      0 4px 20px rgba(184, 150, 95, 0.15);
  }

  .error {
    margin-top: 4px;
    padding: 4px 8px;
    background: rgba(220, 38, 38, 0.12);
    border: 1px solid rgba(220, 38, 38, 0.35);
    border-radius: 4px;
    font-size: 8px;
    font-weight: 600;
    color: #FCA5A5;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

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
    background: rgba(20, 20, 20, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.05);
    color: rgba(184, 150, 95, 0.75);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .compact-submit {
    width: 100%;
    height: 38px;
    position: relative;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    cursor: pointer;
    border: 2px solid rgba(212, 175, 55, 0.8);
    border-radius: 10px;
    overflow: hidden;
    margin-top: 4px;
    
    background: linear-gradient(135deg, 
      var(--gold-primary) 0%,
      var(--gold-bright) 50%,
      var(--gold-primary) 100%
    );
    
    box-shadow: 
      0 0 50px rgba(212, 175, 55, 0.4),
      0 8px 24px rgba(0, 0, 0, 0.5),
      inset 0 2px 0 rgba(255, 255, 255, 0.2),
      inset 0 -2px 0 rgba(0, 0, 0, 0.2);
    
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.15em;
    color: rgba(10, 10, 10, 0.95);
    text-transform: uppercase;
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.3);
    
    transition: all 400ms cubic-bezier(0.23, 1, 0.32, 1);
  }

  .compact-submit::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(255, 255, 255, 0.3) 50%,
      transparent 100%
    );
    background-size: 200% 100%;
    animation: ctaShimmer 2.5s infinite linear;
    opacity: 0.6;
  }

  @keyframes ctaShimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  .compact-submit:hover:not(:disabled) {
    transform: translateY(-4px) scale(1.02);
    background: linear-gradient(135deg, 
      var(--gold-bright) 0%,
      var(--gold-light) 50%,
      var(--gold-bright) 100%
    );
    border-color: rgba(240, 200, 80, 1);
    box-shadow: 
      0 0 70px rgba(212, 175, 55, 0.6),
      0 12px 36px rgba(0, 0, 0, 0.6),
      inset 0 2px 0 rgba(255, 255, 255, 0.4);
  }

  .compact-submit:active:not(:disabled) {
    transform: translateY(-2px) scale(1);
  }

  .compact-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  /* =============== SUCCESS MODAL (优化版) =============== */
  .success-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 10000;
    background: rgba(0, 0, 0, 0.92);
    backdrop-filter: blur(24px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: overlayFadeIn 600ms cubic-bezier(0.23, 1, 0.32, 1);
  }

  @keyframes overlayFadeIn {
    from {
      opacity: 0;
      backdrop-filter: blur(0px);
    }
    to {
      opacity: 1;
      backdrop-filter: blur(24px);
    }
  }

  .success-modal-card {
    position: relative;
    width: 100%;
    max-width: 440px;
    padding: 48px 36px;
    background: linear-gradient(135deg, 
      rgba(20, 22, 28, 0.98) 0%, 
      rgba(15, 17, 22, 0.99) 100%
    );
    border: 2px solid rgba(184, 150, 95, 0.5);
    border-radius: 20px;
    backdrop-filter: blur(40px) saturate(180%);
    box-shadow: 
      0 0 0 1px rgba(255, 255, 255, 0.12),
      0 24px 80px rgba(0, 0, 0, 0.8),
      0 0 100px rgba(184, 150, 95, 0.35),
      inset 0 2px 0 rgba(255, 255, 255, 0.15),
      inset 0 0 80px rgba(184, 150, 95, 0.08);
    animation: cardEnter 800ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
    text-align: center;
  }

  @keyframes cardEnter {
    0% {
      opacity: 0;
      transform: scale(0.88) translateY(30px);
    }
    100% {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .success-modal-card::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 20px;
    background: linear-gradient(135deg,
      rgba(184, 150, 95, 0.4) 0%,
      transparent 45%,
      rgba(212, 175, 55, 0.35) 100%
    );
    opacity: 0.9;
    pointer-events: none;
    animation: borderPulse 3s ease-in-out infinite;
  }

  @keyframes borderPulse {
    0%, 100% {
      opacity: 0.7;
      filter: blur(0px);
    }
    50% {
      opacity: 1;
      filter: blur(1px);
    }
  }

  .success-icon-wrapper {
    margin-bottom: 24px;
    animation: iconFloat 3s ease-in-out infinite;
  }

  @keyframes iconFloat {
    0%, 100% {
      transform: translateY(0) scale(1);
    }
    50% {
      transform: translateY(-12px) scale(1.05);
    }
  }

  .success-icon {
    font-size: 72px;
    display: inline-block;
    filter: drop-shadow(0 0 28px rgba(212, 175, 55, 0.8));
    animation: iconGlow 2s ease-in-out infinite;
  }

  @keyframes iconGlow {
    0%, 100% {
      filter: drop-shadow(0 0 28px rgba(212, 175, 55, 0.7));
      transform: rotate(0deg);
    }
    50% {
      filter: drop-shadow(0 0 40px rgba(212, 175, 55, 1));
      transform: rotate(180deg);
    }
  }

  .success-title {
    font-size: 26px;
    font-weight: 800;
    color: var(--cream);
    margin: 0 0 16px 0;
    line-height: 1.25;
    letter-spacing: -0.03em;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    text-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
    animation: textFadeIn 800ms cubic-bezier(0.23, 1, 0.32, 1) 300ms both;
  }

  .success-subtitle {
    font-size: 15px;
    font-weight: 600;
    color: rgba(232, 232, 224, 0.95);
    margin: 0 0 12px 0;
    line-height: 1.6;
    letter-spacing: -0.01em;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    animation: textFadeIn 800ms cubic-bezier(0.23, 1, 0.32, 1) 400ms both;
  }

  .success-hint {
    font-size: 13px;
    font-weight: 600;
    color: rgba(184, 150, 95, 0.95);
    margin: 0 0 32px 0;
    line-height: 1.6;
    letter-spacing: 0em;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    animation: textFadeIn 800ms cubic-bezier(0.23, 1, 0.32, 1) 500ms both;
  }

  .success-hint strong {
    color: var(--gold-bright);
    font-weight: 800;
    text-shadow: 0 0 12px rgba(212, 175, 55, 0.5);
  }

  @keyframes textFadeIn {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .success-cta {
    width: 100%;
    height: 52px;
    position: relative;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    cursor: pointer;
    border: none;
    border-radius: 12px;
    overflow: hidden;
    
    background: linear-gradient(135deg, 
      #b8965f 0%,
      #d4af37 50%,
      #b8965f 100%
    );
    
    box-shadow: 
      0 0 60px rgba(212, 175, 55, 0.5),
      0 8px 28px rgba(0, 0, 0, 0.5),
      inset 0 2px 0 rgba(255, 255, 255, 0.25),
      inset 0 -2px 0 rgba(0, 0, 0, 0.2);
    
    font-size: 14px;
    font-weight: 800;
    letter-spacing: 0.15em;
    color: rgba(10, 10, 10, 0.98);
    text-transform: uppercase;
    text-shadow: 
      0 1px 0 rgba(255, 255, 255, 0.4),
      0 2px 8px rgba(255, 255, 255, 0.2);
    
    transition: all 300ms cubic-bezier(0.23, 1, 0.32, 1);
    animation: ctaFadeIn 800ms cubic-bezier(0.23, 1, 0.32, 1) 600ms both;
  }

  .success-cta::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(255, 255, 255, 0.4) 50%,
      transparent 100%
    );
    background-size: 200% 100%;
    animation: ctaShimmer 2s infinite linear;
    opacity: 0.8;
  }

  @keyframes ctaFadeIn {
    from {
      opacity: 0;
      transform: translateY(10px) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .success-cta:hover {
    transform: translateY(-2px) scale(1.02);
    background: linear-gradient(135deg, 
      #d4af37 0%,
      #f0c850 50%,
      #d4af37 100%
    );
    box-shadow: 
      0 0 80px rgba(212, 175, 55, 0.7),
      0 12px 40px rgba(0, 0, 0, 0.6),
      inset 0 2px 0 rgba(255, 255, 255, 0.4);
  }

  .success-cta:active {
    transform: translateY(0) scale(0.98);
  }

  .countdown-ring {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 44px;
    height: 44px;
    opacity: 0.5;
  }

  .countdown-svg {
    transform: rotate(-90deg);
    width: 100%;
    height: 100%;
  }

  .countdown-bg {
    fill: none;
    stroke: rgba(184, 150, 95, 0.2);
    stroke-width: 2;
  }

  .countdown-progress {
    fill: none;
    stroke: rgba(212, 175, 55, 0.7);
    stroke-width: 2;
    stroke-linecap: round;
    stroke-dasharray: 100;
    stroke-dashoffset: 0;
    filter: drop-shadow(0 0 8px rgba(212, 175, 55, 0.6));
    animation: countdownShrink 3s linear forwards;
  }

  @keyframes countdownShrink {
    from {
      stroke-dashoffset: 0;
    }
    to {
      stroke-dashoffset: 100;
    }
  }

  /* =============== RESPONSIVE =============== */
  @media (min-width: 768px) {
    .compact-form-inner {
      max-width: 680px;
      padding: 16px 20px 20px;
    }

    .relaxed-mode {
      gap: 18px;
    }

    .compact-mode {
      gap: 8px;
    }

    .relaxed-mode .compact-header {
      padding: 14px 0 16px;
    }

    .compact-mode .compact-header {
      padding: 8px 0 12px;
    }

    .header-badge {
      font-size: 9px;
      padding: 8px 20px;
      margin-bottom: 12px;
    }

    .compact-title {
      font-size: 24px;
      margin-bottom: 10px;
    }

    .compact-subtitle {
      font-size: 13px;
    }

    .relaxed-mode .pre-form-guide {
      margin: 16px 0;
    }

    .compact-mode .pre-form-guide {
      margin: 12px 0;
    }

    .relaxed-mode .compact-form {
      gap: 12px;
    }

    .compact-mode .compact-form {
      gap: 6px;
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

    .compact-input, .compact-select {
      font-size: 13px;
      padding: 12px 14px;
    }

    .compact-submit {
      height: 50px;
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

    .contact-tab {
      padding: 12px 10px;
      gap: 8px;
    }

    .contact-radio {
      width: 20px;
      height: 20px;
    }

    .radio-heart {
      font-size: 13px;
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

    .success-modal-card {
      max-width: 500px;
      padding: 56px 48px;
    }

    .success-icon {
      font-size: 88px;
    }

    .success-title {
      font-size: 30px;
      margin-bottom: 18px;
    }

    .success-subtitle {
      font-size: 17px;
      margin-bottom: 14px;
    }

    .success-hint {
      font-size: 14px;
      margin-bottom: 36px;
    }

    .success-cta {
      height: 56px;
      font-size: 15px;
    }

    .countdown-ring {
      width: 48px;
      height: 48px;
      top: 24px;
      right: 24px;
    }
  }
      `}</style>
    </div>
  );
}