import { useCallback } from "react";
import { useLocalStorageState } from "./useLocalStorageState";

const KNOWN_PLAYERS_KEY = "botc-known-players";

// A flat, deduplicated directory of every name that's ever been entered as a
// player (across all games and groups), used to power name suggestions.
export function useKnownPlayers() {
  const [knownPlayers, setKnownPlayers] = useLocalStorageState<string[]>(KNOWN_PLAYERS_KEY, []);

  const addKnownPlayers = useCallback(
    (names: string[]) => {
      setKnownPlayers((prev) => {
        const set = new Set(prev);
        let changed = false;
        for (const name of names) {
          const trimmed = name.trim();
          if (trimmed && !set.has(trimmed)) {
            set.add(trimmed);
            changed = true;
          }
        }
        return changed ? Array.from(set).sort((a, b) => a.localeCompare(b)) : prev;
      });
    },
    [setKnownPlayers],
  );

  return { knownPlayers, addKnownPlayers };
}
