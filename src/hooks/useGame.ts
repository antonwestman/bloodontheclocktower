import { useCallback } from "react";
import { useLocalStorageState } from "./useLocalStorageState";
import type { GameState, Player, ScriptId } from "../types";

const GAME_KEY = "botc-game";

function makeId(): string {
  return crypto.randomUUID();
}

function makePlayer(name: string): Player {
  return {
    id: makeId(),
    name,
    roleId: null,
    isDead: false,
    isDrunk: false,
    reminders: [],
  };
}

function mapPlayer(players: Player[], id: string, fn: (p: Player) => Player): Player[] {
  return players.map((p) => (p.id === id ? fn(p) : p));
}

export function useGame() {
  const [game, setGame] = useLocalStorageState<GameState | null>(GAME_KEY, null);

  const startGame = useCallback(
    (script: ScriptId, playerNames: string[]) => {
      setGame({
        script,
        players: playerNames.map(makePlayer),
        createdAt: Date.now(),
      });
    },
    [setGame],
  );

  const endGame = useCallback(() => {
    setGame(null);
  }, [setGame]);

  const addPlayer = useCallback(
    (name: string) => {
      setGame((prev) => (prev ? { ...prev, players: [...prev.players, makePlayer(name)] } : prev));
    },
    [setGame],
  );

  const removePlayer = useCallback(
    (id: string) => {
      setGame((prev) => (prev ? { ...prev, players: prev.players.filter((p) => p.id !== id) } : prev));
    },
    [setGame],
  );

  const updatePlayer = useCallback(
    (id: string, patch: Partial<Player>) => {
      setGame((prev) => (prev ? { ...prev, players: mapPlayer(prev.players, id, (p) => ({ ...p, ...patch })) } : prev));
    },
    [setGame],
  );

  const setRole = useCallback(
    (id: string, roleId: string | null) => updatePlayer(id, { roleId }),
    [updatePlayer],
  );

  const toggleDead = useCallback(
    (id: string) => {
      setGame((prev) => (prev ? { ...prev, players: mapPlayer(prev.players, id, (p) => ({ ...p, isDead: !p.isDead })) } : prev));
    },
    [setGame],
  );

  const toggleDrunk = useCallback(
    (id: string) => {
      setGame((prev) => (prev ? { ...prev, players: mapPlayer(prev.players, id, (p) => ({ ...p, isDrunk: !p.isDrunk })) } : prev));
    },
    [setGame],
  );

  const addReminder = useCallback(
    (id: string, text: string) => {
      setGame((prev) => (prev ? { ...prev, players: mapPlayer(prev.players, id, (p) => ({ ...p, reminders: [...p.reminders, text] })) } : prev));
    },
    [setGame],
  );

  const removeReminder = useCallback(
    (id: string, index: number) => {
      setGame((prev) =>
        prev
          ? { ...prev, players: mapPlayer(prev.players, id, (p) => ({ ...p, reminders: removeAt(p.reminders, index) })) }
          : prev,
      );
    },
    [setGame],
  );

  const renamePlayer = useCallback(
    (id: string, name: string) => updatePlayer(id, { name }),
    [updatePlayer],
  );

  return {
    game,
    startGame,
    endGame,
    addPlayer,
    removePlayer,
    setRole,
    toggleDead,
    toggleDrunk,
    addReminder,
    removeReminder,
    renamePlayer,
  };
}

function removeAt<T>(items: T[], index: number): T[] {
  return items.slice(0, index).concat(items.slice(index + 1));
}
