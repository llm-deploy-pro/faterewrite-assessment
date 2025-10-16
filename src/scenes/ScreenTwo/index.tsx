import React, { useState } from 'react';
import ScreenTwoFrontComponent from './ScreenTwoFront';
import ScreenTwoBackComponent from './ScreenTwoBack';

interface ScreenTwoProps {
  onCheckout?: () => void;
}

/** ✅ 最小修复：为后屏组件添加期望的 props 类型断言，避免被推断成 ScreenTwoFrontProps */
type ScreenTwoBackExpectedProps = { onCheckout: () => void };
const ScreenTwoBackFixed = ScreenTwoBackComponent as unknown as React.FC<ScreenTwoBackExpectedProps>;

const ScreenTwo: React.FC<ScreenTwoProps> = ({ onCheckout }) => {
  const [showBack, setShowBack] = useState(false);

  const handleContinue = () => {
    console.log('[S2] 切换到后屏'); // 调试日志
    
    // 埋点：S2A CTA点击
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('S2A_CTA_Click', {
        timestamp: new Date().toISOString()
      });
    }
    
    setShowBack(true);
    
    // 滚动到顶部
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };

  const handleCheckout = () => {
    console.log('[S2] 点击支付按钮'); // 调试日志
    
    // 埋点：S2B CTA点击
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('S2B_CTA_Click', {
        timestamp: new Date().toISOString()
      });
    }
    
    if (onCheckout) {
      onCheckout();
    } else {
      // 如果没有传入 onCheckout，默认跳转
      window.location.href = '/checkout';
    }
  };

  console.log('[S2] showBack状态:', showBack); // 调试日志

  return (
    <>
      {!showBack ? (
        <ScreenTwoFrontComponent onContinue={handleContinue} />
      ) : (
        <ScreenTwoBackFixed onCheckout={handleCheckout} />
      )}
    </>
  );
};

// 默认导出
export default ScreenTwo;

// 命名导出前屏组件
export const ScreenTwoFront: React.FC = () => {
  const [showBack, setShowBack] = useState(false);

  const handleContinue = () => {
    console.log('[S2Front] 切换到后屏'); // 调试日志
    
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('S2A_CTA_Click', {
        timestamp: new Date().toISOString()
      });
    }
    
    setShowBack(true);
    
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };

  const handleCheckout = () => {
    console.log('[S2Front] 点击支付按钮'); // 调试日志
    
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('S2B_CTA_Click', {
        timestamp: new Date().toISOString()
      });
    }
    
    window.location.href = '/checkout';
  };

  console.log('[S2Front] showBack状态:', showBack); // 调试日志

  return (
    <>
      {!showBack ? (
        <ScreenTwoFrontComponent onContinue={handleContinue} />
      ) : (
        <ScreenTwoBackFixed onCheckout={handleCheckout} />
      )}
    </>
  );
};
