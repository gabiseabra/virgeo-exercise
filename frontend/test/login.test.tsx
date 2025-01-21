import userEvent from "@testing-library/user-event";
import { mockFetch, mockLocalStorage, renderRoute, screen } from "./utils";

describe('/login', () => {
  it('should redirect to / if already authenticated', async () => {
    mockLocalStorage({ 'ACCESS_TOKEN': { accessToken: 'token' } });
    const fetch = mockFetch();
    fetch.get(/.*/, JSON.stringify({}))

    const { location } = await renderRoute('/login');

    expect(location.current?.pathname).toBe('/');
  });

  it('should redirect to / on login success', async () => {
    const fetch = mockFetch();
    fetch
      .get(/.*/, JSON.stringify({}))
      .post('http://localhost:3000/login', {
        status: 200,
        body: { accessToken: 'token' },
      })

    const { location, user } = await renderRoute('/login');

    expect(location.current?.pathname).toBe('/login');

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Login' });

    await user.type(usernameInput, 'user');
    await user.type(passwordInput, 'pass');
    await user.click(submitButton);

    await screen.findByText('Logout');

    expect(fetch).toHaveFetched('http://localhost:3000/login', {
      method: 'POST',
      body: { username: 'user', password: 'pass' },
    });

    expect(location.current?.pathname).toBe('/');
  });

  it('should show error message on login error', async () => {
    const fetch = mockFetch();
    fetch
      .post('http://localhost:3000/login', {
        status: 401,
        body: { error: 'Invalid username or password' },
      })

    const { user } = await renderRoute('/login');

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Login' });

    await user.type(usernameInput, 'user');
    await user.type(passwordInput, 'pass');
    await user.click(submitButton);

    expect(await screen.findByText('Invalid username or password')).toBeInTheDocument();
  });
});
