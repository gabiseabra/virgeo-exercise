import '@testing-library/jest-dom';
import fetchMockJest, { manageFetchMockGlobally } from '@fetch-mock/jest';
import { jest } from '@jest/globals';
import { TextEncoder, TextDecoder } from 'util';

manageFetchMockGlobally(jest);

Object.assign(global, { TextDecoder, TextEncoder });

beforeEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
  fetchMockJest.unmockGlobal();
  global.localStorage.clear();
});
