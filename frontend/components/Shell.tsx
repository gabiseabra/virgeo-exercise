import { useAuth } from '@/context/auth'
import { createSlot } from '@/context/slots'
import * as Styles from './Shell.module.scss'
import World from './World'

const Header = createSlot()

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className={Styles.wrapper} data-testid="Shell">
      <header className={Styles.header} data-testid="Shell.header">
        <Header.Slot />
        <LogoutButton />
      </header>
      <main className={Styles.main} data-testid="Shell.main">
        {children}
        <World />
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
