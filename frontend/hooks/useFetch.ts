import { useAuth } from '@/context/auth'
import { useCallback, useState } from 'react'

const BE_SERVER = 'http://localhost:3000'

export enum ApiErrorType {
  Unauthorized = 'Unauthorized',
  InvalidInput = 'InvalidInput',
  InternalError = 'InternalError',
}

export class ApiError extends Error {
  code: number

  constructor(code: number, error: string) {
    super(error)
    this.code = code
  }

  static async fromResponse(response: Response): Promise<ApiError> {
    const { status } = response
    const message = (await response.json()).error ?? response.statusText
    return new ApiError(status, message)
  }

  get type(): ApiErrorType {
    if (this.code === 401) {
      return ApiErrorType.Unauthorized
    }
    if (this.code === 400) {
      return ApiErrorType.InvalidInput
    }
    return ApiErrorType.InternalError
  }
}

export type ApiResponse<T> = {
  loading: boolean
  data?: T
  error?: ApiError
}

export const ApiResponse = <T>(options: Partial<ApiResponse<T>>): ApiResponse<T> => ({
  loading: false,
  ...options,
})

export type UseFetchOptions = {
  method: 'POST' | 'GET'
  url: string
}

export type UseFetch<Out, In> = [ApiResponse<Out>, ((data: In) => Promise<Out>)]

/**
 * Fetch data from the backend and handle the loading and error states.
 * @note This hook handles authorization by referencing the auth context if available, otherwise it will fetch data
 *      without an access token.
 * @note By default, the user will log out if there is an Unauthorized error.
 * @note The returned fetch function will throw an error if the response is not ok. The caller should handle the error.
 *       See methods below for a helpers to handle errors.
 * @param method - HTTP method to use
 * @param url - URL to fetch data from
 * @returns A tuple with the response object and a function to fetch data
 */
export function useFetch<Out, In = void>({ method, url }: UseFetchOptions): UseFetch<Out, In> {
  const { data: { accessToken } = {}, logout } = useAuth()
  const [response, setResponse] = useState<ApiResponse<Out>>({ loading: false })
  const request = useCallback(async (input: In): Promise<Out> => {
    setResponse({ loading: true })
    const response = await window.fetch(`${BE_SERVER}${url}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : {}),
        ...(typeof input !== 'undefined'
          ? {
              'Content-Type': 'application/json',
            }
          : {}),
      },
      ...(typeof input !== 'undefined'
        ? {
            body: JSON.stringify(input),
          }
        : {}),
    })
    const error = !response.ok ? await ApiError.fromResponse(response) : undefined
    const data: Out = error ? undefined : await response.json()
    setResponse({ loading: false, data, error })
    if (error?.type === ApiErrorType.Unauthorized) {
      logout()
    }
    if (error) throw error
    return data
  }, [method, url, accessToken, logout])
  return [response, request]
}

export const handleApiError = (fn: (error: ApiError) => void, predicate?: (error: ApiError) => boolean) => (error: unknown) => {
  if (error && error instanceof ApiError && (!predicate || predicate(error))) return fn(error)
  throw error
}

export const logApiError = (predicate?: (error: ApiError) => boolean) => handleApiError(console.error, predicate)
