import { Navigate, Route, Routes } from "react-router-dom";
import { SchedulePage } from "./pages/SchedulePage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/schedule" replace />} />
      <Route path="/schedule" element={<SchedulePage />} />
      <Route path="*" element={<Navigate to="/schedule" replace />} />
    </Routes>
  );
}
