import { useCallback } from "react";
import { useLocalStorageState } from "./useLocalStorageState";
import type { BuiltinScriptId, CustomRole, GameState, Player, ScriptRef } from "../types";
import { secondaryRoleSlotsFor } from "../data/roles";

const GAME_KEY = "botc-game";

// Older saved games stored `script` as a plain "tb" | "bmr" | "sv" string,
// before custom scenarios existed. Upgrade that shape on load instead of
// crashing on it; drop anything else that doesn't look like a real game.
function migrateGameState(parsed: unknown): GameState | null {
  if (parsed === null || typeof parsed !== "object") return null;
  const raw = parsed as Record<string, unknown>;
  if (!raw.script || !Array.isArray(raw.players) || typeof raw.createdAt !== "number") return null;

  let script: ScriptRef;
  if (typeof raw.script === "string") {
    script = { kind: "builtin", id: raw.script as BuiltinScriptId };
  } else {
    const s = raw.script as Record<string, unknown>;
    if (s.kind === "builtin" && typeof s.id === "string") {
      script = { kind: "builtin", id: s.id as BuiltinScriptId };
    } else if (s.kind === "custom" && typeof s.id === "string" && typeof s.name === "string" && Array.isArray(s.roles)) {
      script = { kind: "custom", id: s.id, name: s.name, roles: s.roles as CustomRole[] };
    } else {
      return null;
    }
  }

  const players = (raw.players as Player[]).map((p) => ({
    ...p,
    secondaryRoleIds: p.secondaryRoleIds ?? [],
  }));

  return { script, players, createdAt: raw.createdAt };
}

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
    secondaryRoleIds: [],
  };
}

function mapPlayer(players: Player[], id: string, fn: (p: Player) => Player): Player[] {
  return players.map((p) => (p.id === id ? fn(p) : p));
}

export function useGame() {
  const [game, setGame] = useLocalStorageState<GameState | null>(GAME_KEY, null, migrateGameState);

  const startGame = useCallback(
    (script: ScriptRef, playerNames: string[]) => {
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
    (id: string, roleId: string | null) => {
      const slotCount = secondaryRoleSlotsFor(roleId).reduce((sum, slot) => sum + slot.count, 0);
      updatePlayer(id, { roleId, secondaryRoleIds: new Array(slotCount).fill(null) });
    },
    [updatePlayer],
  );

  const setSecondaryRole = useCallback(
    (id: string, index: number, roleId: string | null) => {
      setGame((prev) =>
        prev
          ? {
              ...prev,
              players: mapPlayer(prev.players, id, (p) => {
                const secondaryRoleIds = [...p.secondaryRoleIds];
                secondaryRoleIds[index] = roleId;
                return { ...p, secondaryRoleIds };
              }),
            }
          : prev,
      );
    },
    [setGame],
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

  const swapSeats = useCallback(
    (idA: string, idB: string) => {
      setGame((prev) => {
        if (!prev) return prev;
        const indexA = prev.players.findIndex((p) => p.id === idA);
        const indexB = prev.players.findIndex((p) => p.id === idB);
        if (indexA === -1 || indexB === -1 || indexA === indexB) return prev;
        const players = [...prev.players];
        [players[indexA], players[indexB]] = [players[indexB], players[indexA]];
        return { ...prev, players };
      });
    },
    [setGame],
  );

  // Moves a single player into the gap that sits right after `afterIndex`
  // (the original array index, before removal) — everyone else keeps their
  // relative order, unlike swapSeats which exchanges two players.
  const movePlayerToGap = useCallback(
    (id: string, afterIndex: number) => {
      setGame((prev) => {
        if (!prev) return prev;
        const fromIndex = prev.players.findIndex((p) => p.id === id);
        if (fromIndex === -1) return prev;
        const players = [...prev.players];
        const [moved] = players.splice(fromIndex, 1);
        const insertIndex = fromIndex <= afterIndex ? afterIndex : afterIndex + 1;
        players.splice(insertIndex, 0, moved);
        return { ...prev, players };
      });
    },
    [setGame],
  );

  return {
    game,
    startGame,
    endGame,
    addPlayer,
    removePlayer,
    setRole,
    setSecondaryRole,
    toggleDead,
    toggleDrunk,
    addReminder,
    removeReminder,
    renamePlayer,
    swapSeats,
    movePlayerToGap,
  };
}

function removeAt<T>(items: T[], index: number): T[] {
  return items.slice(0, index).concat(items.slice(index + 1));
}
