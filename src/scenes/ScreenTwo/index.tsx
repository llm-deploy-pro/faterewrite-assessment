// 文件路径：src/scenes/ScreenTwo/index.tsx

import React, { useState } from 'react';
import ScreenTwoFrontComponent from './ScreenTwoFront';
import ScreenTwoBackComponent from './ScreenTwoBack';

interface ScreenTwoProps {
  onCheckout?: () => void;
}

// ✅ 局部包装以兼容传参（不改动子组件声明）
const ScreenTwoFrontWithProps =
  ScreenTwoFrontComponent as unknown as React.ComponentType<{ onContinue: () => void }>;
const ScreenTwoBackWithProps =
  ScreenTwoBackComponent as unknown as React.ComponentType<{ onCheckout: () => void }>;

const ScreenTwo: React.FC<ScreenTwoProps> = ({ onCheckout }) => {
  const [showBack, setShowBack] = useState(false);

  const handleContinue = () => {
    // 埋点：S2A CTA点击
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('S2A_CTA_Click', {
        timestamp: new Date().toISOString()
      });
    }
    
    setShowBack(true);
    
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCheckout = () => {
    // 埋点：S2B CTA点击
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('S2B_CTA_Click', {
        timestamp: new Date().toISOString()
      });
    }
    
    if (onCheckout) {
      onCheckout();
    }
  };

  return (
    <>
      {!showBack ? (
        <ScreenTwoFrontWithProps onContinue={handleContinue} />
      ) : (
        <ScreenTwoBackWithProps onCheckout={handleCheckout} />
      )}
    </>
  );
};

// 默认导出（用于 /screen-2 路由）
export default ScreenTwo;

// 命名导出前屏组件（用于独立路由）
export const ScreenTwoFront: React.FC = () => {
  const [showBack, setShowBack] = useState(false);

  const handleContinue = () => {
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('S2A_CTA_Click', {
        timestamp: new Date().toISOString()
      });
    }
    setShowBack(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCheckout = () => {
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('S2B_CTA_Click', {
        timestamp: new Date().toISOString()
      });
    }
    // 跳转到支付页
    window.location.href = '/checkout';
  };

  return (
    <>
      {!showBack ? (
        <ScreenTwoFrontWithProps onContinue={handleContinue} />
      ) : (
        <ScreenTwoBackWithProps onCheckout={handleCheckout} />
      )}
    </>
  );
};
