import { useAuth } from '@/context/auth';
import { createSlot } from '@/context/slots';
import * as Styles from './Shell.module.scss';

const Header = createSlot(Symbol('Header'));

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className={Styles.main}>
      <div className={Styles.header}>
        <Header.Slot />
        <LogoutButton />
      </div>
      <div className={Styles.content}>
        {children}
      </div>
    </main>
  );
}

Shell.Header = Header.Fill;

function LogoutButton() {
  const { data, logout } = useAuth();
  if (!data) return null;
  return (
    <button onClick={logout}>Logout</button>
  );
}
