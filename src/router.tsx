// src/router.tsx 或 App.tsx（根据你的项目结构）

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ScreenOne from "./scenes/ScreenOne";
import ScreenTwo from "./scenes/ScreenTwo";  // 直接导入默认导出

export default function RouterApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ScreenOne />} />
        <Route path="/screen-1" element={<ScreenOne />} />
        {/* Tonight's Map 单页面 */}
        <Route path="/screen-2" element={<ScreenTwo />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}