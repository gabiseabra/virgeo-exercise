import * as Styles from './Shell.module.scss';

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className={Styles.Shell}>
      {children}
    </div>
  );
}
