import { renderRoute } from "./utils";

describe('/', () => {
  it('should redirect to /login if not authenticated', async () => {
    const { container } = renderRoute('/');
    expect(container.innerHTML).toEqual('<div>Loading...</div>');
  });
});
