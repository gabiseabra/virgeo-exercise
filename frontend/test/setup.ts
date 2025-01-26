import '@testing-library/jest-dom'
import { manageFetchMockGlobally } from '@fetch-mock/jest'
import { jest } from '@jest/globals'
import { TextEncoder, TextDecoder } from 'util'

manageFetchMockGlobally(jest)

Object.assign(global, { TextDecoder, TextEncoder })
