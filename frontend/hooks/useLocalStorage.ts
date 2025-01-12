import { useCallback, useState } from "react";

export function useLocalStorage<T extends object>(name: string, defaultValue: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    const item = localStorage.getItem(name);
    return item ? JSON.parse(item) : defaultValue;
  });
  const set = useCallback((value: T) => {
    setValue(value);
    localStorage.setItem(name, JSON.stringify(value));
  }, [name]);
  return [value, set];
}
