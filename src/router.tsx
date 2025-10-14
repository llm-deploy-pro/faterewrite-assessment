import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ScreenOne from "./scenes/ScreenOne";   // 目录下的 index.tsx 默认导出
import ScreenTwo from "./scenes/ScreenTwo";   // 目录下的 index.tsx 默认导出

export default function RouterApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ScreenOne />} />
        <Route path="/screen-1" element={<ScreenOne />} />
        <Route path="/screen-2" element={<ScreenTwo />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
