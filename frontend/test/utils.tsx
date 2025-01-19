import React from 'react'
import { MemoryRouter } from 'react-router'
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

export const renderRoute = (route: string) =>
  RTL.render(
    <Wrapper route={route}>
      <Shell>
        <Routes />
      </Shell>
    </Wrapper>
  );

export const flushPromises = () => RTL.act(() => new Promise((resolve) => setTimeout(resolve, 0)));

export const mockLocalStorage = (values: Partial<StorageMap> = {}) => {
  jest.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation((key) => JSON.stringify(values[key as StorageKey]));
}
