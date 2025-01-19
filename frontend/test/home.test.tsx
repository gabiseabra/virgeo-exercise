import { act, fetchMock, flushPromises, mockLocalStorage, renderRoute, screen } from "./utils";

describe('/', () => {
  it('should redirect to /login if not authenticated', async () => {
    renderRoute('/');

    expect(screen.getByTestId('Shell.header')).toContainHTML('<h1>Login</h1>');
  });

  it.only('should render the map if authenticated', async () => {
    mockLocalStorage({
      'ACCESS_TOKEN': { accessToken: 'token' }
    });
    fetchMock.get('http://localhost:3000/data', {
      status: 200,
      body: {
        "type": "FeatureCollection",
        "features": [],
      },
    })

    renderRoute('/');

    expect(screen.getByTestId('Shell.main')).toHaveTextContent('Loading...');

    await flushPromises();

    expect(screen.getByTestId('Shell.header')).toContainHTML('<h1>Map</h1>');
    expect(screen.getByTestId('Shell.header')).toContainHTML('<button>Logout</button>');
  });
});
