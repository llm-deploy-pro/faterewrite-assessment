// src/scenes/ScreenTwo/index.tsx

import React from 'react';
import ScreenTwoBack from './ScreenTwoBack';

interface ScreenTwoProps {
  onCheckout?: () => void;
}

/**
 * Tonight's Map - 单页面组件
 * 直接展示转化页面，无前后屏切换
 */
const ScreenTwo: React.FC<ScreenTwoProps> = ({ onCheckout }) => {
  
  const handleCheckout = () => {
    console.log('[Tonight\'s Map] 点击CTA按钮');
    
    // 埋点：S2B CTA点击（保留原有事件名）
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('S2B_CTA_Click', {
        timestamp: new Date().toISOString(),
        content: 'tonight_map'
      });
    }
    
    // 如果有传入 onCheckout 回调，则执行
    if (onCheckout) {
      onCheckout();
    }
  };

  // 直接渲染单页面
  return <ScreenTwoBack onCheckout={handleCheckout} />;
};

// 默认导出
export default ScreenTwo;