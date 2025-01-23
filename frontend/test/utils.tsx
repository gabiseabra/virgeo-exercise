import React, { forwardRef, useImperativeHandle } from 'react'
import { Location, MemoryRouter, useLocation } from 'react-router'
import * as THREE from 'three'
import * as RTL from '@testing-library/react'
import userEvent, { UserEvent } from '@testing-library/user-event'
import ReactThreeTestRenderer from '@react-three/test-renderer'
import fetchMockJest from '@fetch-mock/jest'
import Context from '@/context'
import Shell from '@/components/app/Shell'
import Routes from '@/routes'
import { StorageKey, StorageMap } from '@/hooks/useLocalStorage'

export * from '@testing-library/react'

/** Integration testing */

type WrapperProps = {
  children: React.ReactNode
  route?: string
}

export const Wrapper = ({ children, route = '/' }: WrapperProps) => (
  <React.StrictMode>
    <MemoryRouter initialEntries={[route]}>
      <Context>
        {children}
      </Context>
    </MemoryRouter>
  </React.StrictMode>
)

type RenderResult = RTL.RenderResult & {
  /** A ref object containing the current `Location`. */
  location: React.RefObject<Location | null>
  /** A user-event instance for simulating interactions. */
  user: UserEvent
}

export const renderRoute = async (route: string): Promise<RenderResult> => {
  const user = userEvent.setup()
  const location = React.createRef<Location>()
  return RTL.act(() => ({
    user,
    location,
    ...RTL.render(
      <Wrapper route={route}>
        <LocationProvider ref={location} />
        <Shell>
          <Routes />
        </Shell>
      </Wrapper>,
    ),
  }))
}

const LocationProvider = forwardRef(function LocationProvider(_: object, ref?: React.ForwardedRef<Location>) {
  const location = useLocation()
  useImperativeHandle(ref, () => location, [location])
  return null
})

/** @react-three/fiber (R3F) canvas testing */

/**
 * Controller for an instance of `@react-three/fiber` renderer.
 * @note We're using the rc version of `@react-three/test-renderer` for React 19 support, but something is wrong with
 *       the types, so we're defining our own wrapper.
 * @note The names of the methods match the ones from `@testing-library/react` rather than the original ones.
*/
type RenderR3FResult = {
  rerender: (element: React.ReactNode) => Promise<void>
  advanceTimer: (ms: number) => Promise<void>
}

export const renderR3F = async (element: React.ReactNode): Promise<RenderR3FResult> => {
  const renderer = await ReactThreeTestRenderer.create(element)
  const clockRef = { current: 0 }

  return {
    rerender: async (element: React.ReactNode) => {
      renderer.update(element)
    },
    advanceTimer: async (ms: number) => {
      clockRef.current += ms
      const spy = jest.spyOn(THREE.Clock.prototype, 'getElapsedTime').mockImplementation(() => {
        // getElapsedTime returns seconds
        return clockRef.current / 1000
      })
      try {
        await renderer.advanceFrames(1, ms)
      } finally {
        spy.mockRestore()
      }
    },
  }
}

export const actR3F = (fn: () => void) =>
  ReactThreeTestRenderer.act(fn)

type FetchMock = ReturnType<typeof fetchMockJest.mockGlobal>

/** Mocks */

export const mockFetch = (): FetchMock => {
  return fetchMockJest.mockGlobal()
}

export const unmockFetch = (): void => {
  fetchMockJest.unmockGlobal()
  fetchMockJest.mockRestore()
}

export const mockLocalStorage = (values: Partial<StorageMap> = {}) => {
  jest.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation(key => JSON.stringify(values[key as StorageKey]))
}

export const unmockLocalStorage = () => {
  unmock(window.localStorage.getItem)
  window.localStorage.clear()
}

/** Internal functions */

const isMock = (fn: unknown): fn is jest.Mock => !!(fn as jest.Mock).mock

const unmock = (fn: unknown) => {
  if (isMock(fn)) {
    fn.mockRestore()
  }
}
