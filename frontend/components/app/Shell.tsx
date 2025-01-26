import { useAuth } from '@/context/auth'
import { createSlotFill } from '@/context/slots'
import World from '@/components/three/World'
import { ToastContainer, useToast } from '@/components/ui/Feedback'
import { Button } from '@/components/ui/Interactive'

import * as Styles from './Shell.module.scss'

const Header = createSlotFill('Shell.Header')

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className={Styles.wrapper} data-testid="Shell">
      <header className={Styles.header} data-testid="Shell.header">
        <Header.Slot />
        <div className={Styles.spacer} />
        <LogoutButton />
      </header>

      <main className={Styles.main} data-testid="Shell.main">
        {children}
        <div className={Styles.world}>
          <World />
        </div>
      </main>

      <ToastContainer />
    </div>
  )
}

Shell.Header = Header.Fill

function LogoutButton() {
  const toast = useToast()
  const { data, logout } = useAuth()

  const handleLogout = () => {
    logout()
    toast.success({ children: 'Logged out!' })
  }

  if (!data) return null
  return (
    <Button type="button" onClick={handleLogout}>Logout</Button>
  )
}
