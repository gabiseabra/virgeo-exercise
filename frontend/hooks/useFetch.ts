import { useAuth } from "@/context/auth";
import { useCallback, useState } from "react";

const BE_SERVER = 'http://localhost:3000';

export enum ApiErrorType {
  Unauthorized = 'Unauthorized',
  InvalidInput = 'InvalidInput',
  InternalError = 'InternalError',
}

export class ApiError extends Error {
  code: number;

  constructor(public response: Response) {
    super(response.statusText);
    this.code = response.status;
  }

  get type(): ApiErrorType {
    if (this.code === 401) {
      return ApiErrorType.Unauthorized;
    }
    if (this.code === 400) {
      return ApiErrorType.InvalidInput;
    }
    return ApiErrorType.InternalError;
  }
}

export type ApiResponse<T> = {
  loading: boolean;
  data?: T;
  error?: ApiError;
};

export type UseFetchOptions<In> = {
  method: 'POST' | 'GET';
  url: string;
}

export type UseFetch<Out, In> = [ApiResponse<Out>, ((data: In) => Promise<Out>)];

/**
 * Fetch data from the backend.
 * This hook handles the loading state and error handling.
 * @note This hook handles authorization by referencing the auth context if available, otherwise it will fetch data
 *      without an access token.
 * @note The fetch function can throw an ApiError if the response is not ok. If the error is not caught, it will be
 *       thrown to the parent component, otherwise it will be stored in the response object.
 * @param method - HTTP method to use
 * @param url - URL to fetch data from
 * @returns A tuple with the response object and a function to fetch data
 */
export function useFetch<Out, In = void>({ method, url }: UseFetchOptions<In>): UseFetch<Out, In> {
  const { accessToken } = useAuth().data || {};
  const [response, setResponse] = useState<ApiResponse<Out>>({ loading: false });
  const fetch = useCallback(async (input: In): Promise<Out> => {
    setResponse({ loading: true });
    const response = await window.fetch(`${BE_SERVER}${url}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(typeof input !== 'undefined' ? { 'Content-Type': 'application/json'} : {}),
      },
      body: typeof input !== 'undefined' ? JSON.stringify(input) : undefined,
    });
    const error = !response.ok ? new ApiError(response) : undefined;
    const data: Out = error ? undefined : await response.json();
    setResponse({ loading: false, data, error });
    if (error) throw error;
    return data;
  }, [method, url, accessToken]);
  return [response, fetch];
}
