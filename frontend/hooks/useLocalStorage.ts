import { useCallback, useState } from 'react'

export function useLocalStorage<K extends StorageKey>(name: K, defaultValue: StorageType<K>): [StorageType<K>, (value: StorageType<K>) => void]
export function useLocalStorage<T extends object>(name: string, defaultValue: T): [T, (value: T) => void]
/**
 * A hook that provides a value stored in local storage.
 * @note The data type is inferred from the storage key. If the key is not a known storage key, then it should be
 *       provided explicitly via the generic type parameter.
 */
export function useLocalStorage<T extends object>(name: string, defaultValue: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    const item = localStorage.getItem(name)
    return item ? JSON.parse(item) : defaultValue
  })
  const set = useCallback((value: T) => {
    setValue(value)
    localStorage.setItem(name, JSON.stringify(value))
  }, [name])
  return [value, set]
}

/**
 * A map from known storage keys to their data types.
 */
export type StorageMap = {
  ACCESS_TOKEN: { accessToken?: string }
}

export type StorageKey = keyof StorageMap
export type StorageType<T extends StorageKey> = StorageMap[T]
