import { useCallback } from "react";
import { useLocalStorageState } from "./useLocalStorageState";
import type { PlayerGroup } from "../types";

const PLAYER_GROUPS_KEY = "botc-player-groups";

export function usePlayerGroups() {
  const [playerGroups, setPlayerGroups] = useLocalStorageState<PlayerGroup[]>(PLAYER_GROUPS_KEY, []);

  // Upserts a player group. Pass `id: null` to create a new one — returns
  // the id that was saved to, so callers can keep editing the same group.
  const saveGroup = useCallback(
    (id: string | null, name: string, playerNames: string[]): string => {
      const now = Date.now();
      const resolvedId = id ?? crypto.randomUUID();
      setPlayerGroups((prev) => {
        const existing = prev.find((g) => g.id === resolvedId);
        if (existing) {
          const updated: PlayerGroup = { ...existing, name, playerNames, updatedAt: now };
          return prev.map((g) => (g.id === resolvedId ? updated : g));
        }
        const created: PlayerGroup = { id: resolvedId, name, playerNames, createdAt: now, updatedAt: now };
        return [...prev, created];
      });
      return resolvedId;
    },
    [setPlayerGroups],
  );

  const deleteGroup = useCallback(
    (id: string) => {
      setPlayerGroups((prev) => prev.filter((g) => g.id !== id));
    },
    [setPlayerGroups],
  );

  return { playerGroups, saveGroup, deleteGroup };
}
