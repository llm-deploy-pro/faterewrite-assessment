import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ScreenOne from "./scenes/ScreenOne";           // 目录下的 index.tsx 默认导出
import { ScreenTwoFront } from "./scenes/ScreenTwo";  // ✅ 从目录命名导出（见下一个文件的补充导出）

export default function RouterApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ScreenOne />} />
        <Route path="/screen-1" element={<ScreenOne />} />
        {/* 第二屏路径：进入前屏 S2A */}
        <Route path="/screen-2" element={<ScreenTwoFront />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
