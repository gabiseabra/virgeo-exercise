import React, { forwardRef, useImperativeHandle, useRef } from 'react'
import { Location, MemoryRouter, useLocation } from 'react-router'
import * as RTL from '@testing-library/react'
import Context from '@/context'
import Shell from '@/components/Shell'
import Routes from '@/routes'
import { StorageKey, StorageMap } from '@/hooks/useLocalStorage'

export { default as fetchMock } from '@fetch-mock/jest'
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

export const renderRoute = (route: string): RTL.RenderResult & {
  location: React.RefObject<Location | null>;
} => {
  const location = React.createRef<Location>();
  const renderResult = RTL.render(
    <Wrapper route={route}>
      <LocationProvider ref={location} />
      <Shell>
        <Routes />
      </Shell>
    </Wrapper>
  );
  return { ...renderResult, location };
}

const LocationProvider = forwardRef((_: object, ref?: React.ForwardedRef<Location>) => {
  const location = useLocation();
  useImperativeHandle(ref, () => location, [location]);
  return null;
})

export const flushPromises = () => RTL.act(() => new Promise((resolve) => setTimeout(resolve, 0)));

export const mockLocalStorage = (values: Partial<StorageMap> = {}) => {
  jest.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation((key) => JSON.stringify(values[key as StorageKey]));
}
