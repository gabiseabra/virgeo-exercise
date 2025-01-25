import { AuthProvider } from './auth'
import { SlotFillProvider } from './slots'

export default function AppContext({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SlotFillProvider>
        {children}
      </SlotFillProvider>
    </AuthProvider>
  )
}
