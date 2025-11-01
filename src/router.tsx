// src/App.tsx

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ScreenOne from "./scenes/ScreenOne";
import ScreenTwo from "./scenes/ScreenTwo";
import CheckoutGate from "./scenes/CheckoutGate";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ScreenOne />} />
        <Route path="/screen-1" element={<ScreenOne />} />
        {/* Tonight's Map 单页面 */}
        <Route path="/screen-2" element={<ScreenTwo />} />
        {/* CheckoutGate 过渡页面 */}
        <Route path="/checkout" element={<CheckoutGate />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}