import * as Styles from './Spinner.module.scss';

export default function Spinner() {
  return (
    <div className={Styles.Spinner}>
      <div className={Styles.SpinnerInner} />
    </div>
  );
}
