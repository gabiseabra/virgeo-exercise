import { useCallback } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/context/auth";
import Spinner from "@/components/Spinner";
import Shell from "@/components/Shell";

const getField = (e: React.FormEvent, name: string): string | undefined => {
  const target = e.target as HTMLFormElement;
  return target[name]?.value;
}

export default function Login() {
  const navigate = useNavigate();
  const { loading, error, login } = useAuth();

  const onSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const username = getField(e, 'username');
    const password = getField(e, 'password');
    if (!username || !password) return;
    await login({ username, password });
    navigate('/');
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
          Email
          <input name="username" type="text" required />
        </label>
        <label>
          Password
          <input name="password" type="password" required />
        </label>
        <button type="submit">Login</button>
      </form>
    </div>
  )
}
