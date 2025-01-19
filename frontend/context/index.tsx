import { AuthProvider } from "./auth";
import { SlotsProvider } from "./slots";

export default function AppContext({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SlotsProvider>
        {children}
      </SlotsProvider>
    </AuthProvider>
  );
}
