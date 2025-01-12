// This is the entry point of the frontend application.
import React from 'react';
import ReactDOM from 'react-dom/client';
import Shell from '@/components/Shell';
import Context from '@/context';
import Routes from '@/routes';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Context>
      <Shell>
        <Routes />
      </Shell>
    </Context>
  </React.StrictMode>
);
