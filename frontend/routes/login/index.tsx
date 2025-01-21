import { useCallback, useRef } from "react";
import { useAuth, withAuth } from "@/context/auth";
import Spinner from "@/components/Spinner";
import Shell from "@/components/Shell";
import Redirect from "@/components/Redirect";
import { logApiError } from "@/hooks/useFetch";

function Login() {
  const { loading, error, login } = useAuth();
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const onSubmit = useCallback(async (e: React.SyntheticEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const username = usernameRef.current?.value;
    const password = passwordRef.current?.value;
    if (!username || !password) return;
    await login({ username, password }).catch(logApiError());
  }, [login]);

  return (
    <div>
      <Shell.Header>
        <h1>Login</h1>
      </Shell.Header>

      {loading && <Spinner />}

      <form onSubmit={onSubmit}>
        {error && <div>{error.message}</div>}
        <label>
          Username
          <input ref={usernameRef} name="username" type="text" required />
        </label>
        <label>
          Password
          <input ref={passwordRef} name="password" type="password" required />
        </label>
        <button type="submit" onClick={onSubmit}>Login</button>
      </form>
    </div>
  )
}

export default withAuth(
  () => <Redirect to="/" />,
  Login,
  Login,
);
