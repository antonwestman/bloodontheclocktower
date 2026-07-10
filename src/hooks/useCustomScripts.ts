import { useCallback } from "react";
import { useLocalStorageState } from "./useLocalStorageState";
import type { CustomRole, CustomScript } from "../types";

const CUSTOM_SCRIPTS_KEY = "botc-custom-scripts";

export function useCustomScripts() {
  const [customScripts, setCustomScripts] = useLocalStorageState<CustomScript[]>(CUSTOM_SCRIPTS_KEY, []);

  // Upserts a custom script. Pass `id: null` to create a new one — returns
  // the id that was saved to (a fresh id when creating, the same id when
  // updating), so callers can keep editing the same saved script afterwards.
  const saveScript = useCallback(
    (id: string | null, name: string, roles: CustomRole[]): string => {
      const now = Date.now();
      const resolvedId = id ?? crypto.randomUUID();
      setCustomScripts((prev) => {
        const existing = prev.find((s) => s.id === resolvedId);
        if (existing) {
          const updated: CustomScript = { ...existing, name, roles, updatedAt: now };
          return prev.map((s) => (s.id === resolvedId ? updated : s));
        }
        const created: CustomScript = { id: resolvedId, name, roles, createdAt: now, updatedAt: now };
        return [...prev, created];
      });
      return resolvedId;
    },
    [setCustomScripts],
  );

  const deleteScript = useCallback(
    (id: string) => {
      setCustomScripts((prev) => prev.filter((s) => s.id !== id));
    },
    [setCustomScripts],
  );

  return { customScripts, saveScript, deleteScript };
}
