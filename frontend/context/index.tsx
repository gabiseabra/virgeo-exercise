import { AuthProvider } from "./auth";

export default function AppContext({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
