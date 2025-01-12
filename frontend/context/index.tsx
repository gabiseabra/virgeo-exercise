import { BrowserRouter } from "react-router";
import { AuthProvider } from "./auth";
import { SlotsProvider } from "./slots";

export default function AppContext({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SlotsProvider>
          {children}
        </SlotsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
