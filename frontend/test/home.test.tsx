import { act, fetchMock, flushPromises, mockLocalStorage, renderRoute, screen } from "./utils";

describe('/', () => {
  it('should redirect to /login if not authenticated', async () => {
    const { location } = renderRoute('/');

    await flushPromises();

    expect(location.current?.pathname).toBe('/login');
  });

  it('should render the map if authenticated', async () => {
    mockLocalStorage({ 'ACCESS_TOKEN': { accessToken: 'token' } });
    fetchMock.get(/.*/, JSON.stringify(null));

    const { location } = renderRoute('/');

    await flushPromises();

    expect(location.current?.pathname).toBe('/');
  });
});
