import { useEffect, useState } from "react";

export function useLocalStorageState<T>(key: string, initial: T, migrate?: (parsed: unknown) => T | null) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return initial;
      const parsed: unknown = JSON.parse(raw);
      if (!migrate) return parsed as T;
      const migrated = migrate(parsed);
      return migrated ?? initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore quota / serialization errors
    }
  }, [key, value]);

  return [value, setValue] as const;
}
