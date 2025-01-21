import React, { forwardRef, useImperativeHandle, useRef } from 'react'
import { Location, MemoryRouter, useLocation } from 'react-router'
import * as RTL from '@testing-library/react'
import userEvent, { UserEvent } from '@testing-library/user-event'
import fetchMockJest from '@fetch-mock/jest'
import Context from '@/context'
import Shell from '@/components/Shell'
import Routes from '@/routes'
import { StorageKey, StorageMap } from '@/hooks/useLocalStorage'

export * from '@testing-library/react'

type WrapperProps = {
  children: React.ReactNode;
  route?: string;
};

export const Wrapper = ({ children, route = '/' }: WrapperProps)=> (
  <React.StrictMode>
    <MemoryRouter initialEntries={[route]}>
      <Context>
        {children}
      </Context>
    </MemoryRouter>
  </React.StrictMode>
);

type RenderResult = RTL.RenderResult & {
  location: React.RefObject<Location | null>;
  user: UserEvent;
};

export const renderRoute = async (route: string): Promise<RenderResult> => {
  const user = userEvent.setup();
  const location = React.createRef<Location>();
  return RTL.act(() => ({
    user,
    location,
    ...RTL.render(
      <Wrapper route={route}>
        <LocationProvider ref={location} />
        <Shell>
          <Routes />
        </Shell>
      </Wrapper>
    ),
  }));
}

const LocationProvider = forwardRef((_: object, ref?: React.ForwardedRef<Location>) => {
  const location = useLocation();
  useImperativeHandle(ref, () => location, [location]);
  return null;
})

export const flushPromises = () => RTL.act(() => new Promise((resolve) => setTimeout(resolve, 0)));

type FetchMock = ReturnType<typeof fetchMockJest.mockGlobal>;
export const mockFetch = (): FetchMock => {
  return fetchMockJest.mockGlobal();
};

export const mockLocalStorage = (values: Partial<StorageMap> = {}) => {
  jest.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation((key) => JSON.stringify(values[key as StorageKey]));
}
