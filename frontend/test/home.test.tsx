import { mockFetch, mockLocalStorage, renderRoute } from './utils'

describe('/', () => {
  it('should redirect to /login if not authenticated', async () => {
    const { location } = await renderRoute('/')

    expect(location.current?.pathname).toBe('/login')
  })

  it('should render the map if authenticated', async () => {
    mockLocalStorage({ ACCESS_TOKEN: { accessToken: 'token' } })
    const fetch = mockFetch()
    fetch.get(/.*/, JSON.stringify(null))

    const { location } = await renderRoute('/')

    expect(location.current?.pathname).toBe('/')
  })

  it('should redirect to /login if the initial request is unauthorized', async () => {
    mockLocalStorage({ ACCESS_TOKEN: { accessToken: 'token' } })
    const fetch = mockFetch()
    fetch.get(/.*/, {
      status: 401,
      body: { error: 'Unauthorized' },
    })
    const { location } = await renderRoute('/')

    expect(location.current?.pathname).toBe('/login')
  })
})
