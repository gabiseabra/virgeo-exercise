import { useAuth } from "@/context/auth";
import { useCallback } from "react";
import Spinner from "./Spinner";
import { ApiError, ApiErrorType } from "@/hooks/useFetch";

const getField = (e: React.FormEvent, name: string): string | undefined => {
  const target = e.target as HTMLFormElement;
  return target[name]?.value;
}

export default function Login() {
  const { loading, error, login } = useAuth();
  const onSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const username = getField(e, 'username');
    const password = getField(e, 'password');
    if (!username || !password) return;
    try {
      await login({ username, password });
    } catch(error) {
      // Handle unauthorized errors in this component
      if (error instanceof ApiError && error.type !== ApiErrorType.Unauthorized)
        throw error;
    }
  }, [login]);
  return (
    <div>
      {loading && <Spinner />}
      <h1>Login</h1>
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
