import AppContext from '@/context';
import Login from './Login';
import * as Styles from './App.module.scss';

export default function App() {
  return (
    <div className={Styles.App}>
      <AppContext>
        <Login />
      </AppContext>
    </div>
  );
}
