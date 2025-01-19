import React from 'react'
import { MemoryRouter } from 'react-router'
import * as RTL from '@testing-library/react'
import Context from '@/context'
import Shell from '@/components/Shell'
import Routes from '@/routes'
import { MemoryRouter } from 'react-router'

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
