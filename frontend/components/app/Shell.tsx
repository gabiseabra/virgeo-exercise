import { useAuth } from '@/context/auth'
import { createSlotFill } from '@/context/slots'
import World from '@/components/three/World'

import * as Styles from './Shell.module.scss'

const Header = createSlotFill('Shell.Header')

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className={Styles.wrapper} data-testid="Shell">
      <header className={Styles.header} data-testid="Shell.header">
        <Header.Slot />
        <LogoutButton />
      </header>
      <main className={Styles.main} data-testid="Shell.main">
        {children}
        <div className={Styles.world}>
          <World />
        </div>
      </main>
    </div>
  )
}

Shell.Header = Header.Fill

function LogoutButton() {
  const { data, logout } = useAuth()
  if (!data) return null
  return (
    <button onClick={logout}>Logout</button>
  )
}
