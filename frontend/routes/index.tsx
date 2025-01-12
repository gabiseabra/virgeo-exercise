import { Route, Routes } from "react-router";
import Login from "./login";
import Map from "./map";

export default function App() {
  return (
    <Routes>
      <Route index element={<Map />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}
