import { useState, useEffect, useRef } from "react";
import LuxuryBackground from "../../components/LuxuryBackground";
import ScreenOneFront from "./ScreenOneFront";
import ScreenOneBack from "./ScreenOneBack";

export default function ScreenOne() {
  const [phase, setPhase] = useState<"front" | "back">("front");

  // 固定 3s 自动进入（不添加任意交互提前进入）
  const AUTO_ADV_MS = 3000;

  // ✅ 新增：统一开关（严格不删除原逻辑，仅关闭自动推进）
  const ALLOW_AUTO_ADV = false;

  // 监控：实际切换偏差 / LongTask / FCP
  const tStartRef = useRef<number | null>(null);
  const perfObsRef = useRef<PerformanceObserver | null>(null);

  // ✅ 新增：仅在 CTA 明确触发时推进到后屏（不破坏原结构）
  useEffect(() => {
    const onContinue = () => setPhase("back");
    window.addEventListener("s1:cta:continue", onContinue);
    return () => window.removeEventListener("s1:cta:continue", onContinue);
  }, []);

  useEffect(() => {
    if (phase !== "front") return;

    tStartRef.current = performance.now();

    // （原逻辑保留）自动推进的定时器 —— 受开关控制
    let timer: number | null = null;
    if (ALLOW_AUTO_ADV) {
      // 仅在允许时才设置自动进入
      // @ts-ignore
      timer = setTimeout(() => setPhase("back"), AUTO_ADV_MS);
    }

    // ---- O5: 性能监控（轻量，无第三方依赖） ----
    try {
      // Long Task (main thread >50ms)
      if ("PerformanceObserver" in window && "PerformanceLongTaskTiming" in window) {
        const obs = new PerformanceObserver((list) => {
          for (const e of list.getEntries() as PerformanceEntry[]) {
            // 仅记录，不干预；你可换成上报
            // @ts-ignore
            if (e.duration && e.duration > 50) {
              console.warn("[Perf] LongTask", Math.round((e as any).duration), "ms");
            }
          }
        });
        // @ts-ignore
        obs.observe({ entryTypes: ["longtask"] as any });
        perfObsRef.current = obs;
      }

      // FCP
      if ("PerformanceObserver" in window) {
        const paintObs = new PerformanceObserver((list) => {
          const paints = list.getEntries();
          paints.forEach((p) => {
            if (p.name === "first-contentful-paint") {
              console.log("[Perf] FCP:", Math.round(p.startTime), "ms");
            }
          });
        });
        // @ts-ignore
        paintObs.observe({ type: "paint", buffered: true } as any);
      }
    } catch (err) {
      // 监控失败静默
    }

    return () => {
      // 仅在开启自动推进时清理定时器（不删除原句式）
      if (ALLOW_AUTO_ADV && timer != null) {
        clearTimeout(timer as any);
      }
      if (perfObsRef.current) {
        try { perfObsRef.current.disconnect(); } catch {}
        perfObsRef.current = null;
      }
    };
  }, [phase]);

  // 记录实际切换偏差（仅在允许自动推进时才有意义）
  useEffect(() => {
    if (ALLOW_AUTO_ADV && phase === "back" && tStartRef.current != null) {
      const drift = performance.now() - tStartRef.current - AUTO_ADV_MS;
      console.log("[Timing] AutoAdvance drift:", Math.round(drift), "ms");
      tStartRef.current = null;
    }
  }, [phase]);

  return (
    <LuxuryBackground goldStrength={0.16}>
      {/* 通过 CSS 变量把 3000ms 传给前屏（进度动画同步） */}
      <div className="s1-stack" style={{ ["--auto-ms" as any]: `${AUTO_ADV_MS}ms` }}>
        <section className={`s1-layer ${phase === "front" ? "in" : "out"}`}>
          <ScreenOneFront />
        </section>
        <section className={`s1-layer ${phase === "back" ? "in" : "out"}`}>
          <ScreenOneBack />
        </section>
      </div>

      <style>{`
        .s1-stack{ position:fixed; inset:0; z-index:10; }
        .s1-layer{
          position:absolute; inset:0;
          transition:opacity .28s ease, transform .28s ease;
          will-change:opacity, transform;
        }
        .s1-layer.in{ opacity:1; transform:translateY(0); pointer-events:auto; }
        .s1-layer.out{ opacity:0; transform:translateY(8px); pointer-events:none; }
        html,body{ overflow:hidden; }
      `}</style>
    </LuxuryBackground>
  );
}
