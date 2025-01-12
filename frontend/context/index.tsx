import { BrowserRouter } from "react-router";
import { AuthProvider } from "./auth";

export default function AppContext({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <AuthProvider>
        {children}
      </AuthProvider>
    </BrowserRouter>
  );
}
