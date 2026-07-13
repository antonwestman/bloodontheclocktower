import { useCallback } from "react";
import { useLocalStorageState } from "./useLocalStorageState";
import type { BuiltinScriptId, CustomRole, GameState, NightRecord, Player, ScriptRef } from "../types";
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

  const players = (raw.players as Player[]).map((p) => {
    const legacy = p as Player & { secondaryRoleIds?: (string | null)[] };
    return { ...p, secondaryIds: legacy.secondaryIds ?? legacy.secondaryRoleIds ?? [] };
  });

  const nights = Array.isArray(raw.nights) ? (raw.nights as NightRecord[]) : [];

  return { script, players, createdAt: raw.createdAt, nights };
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
    secondaryIds: [],
  };
}

function mapPlayer(players: Player[], id: string, fn: (p: Player) => Player): Player[] {
  return players.map((p) => (p.id === id ? fn(p) : p));
}

// Sets a player's role and resets their secondary picks to match the new
// role's slots (e.g. clearing a Drunk's believed Townsfolk when reassigned).
function withRole(player: Player, roleId: string | null): Player {
  const slotCount = secondaryRoleSlotsFor(roleId).reduce((sum, slot) => sum + slot.count, 0);
  return { ...player, roleId, secondaryIds: new Array(slotCount).fill(null) };
}

export function useGame() {
  const [game, setGame] = useLocalStorageState<GameState | null>(GAME_KEY, null, migrateGameState);

  const startGame = useCallback(
    (script: ScriptRef, playerNames: string[]) => {
      setGame({
        script,
        players: playerNames.map(makePlayer),
        createdAt: Date.now(),
        nights: [],
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
      setGame((prev) => (prev ? { ...prev, players: mapPlayer(prev.players, id, (p) => withRole(p, roleId)) } : prev));
    },
    [setGame],
  );

  // Assigns roles to multiple players at once (e.g. randomizing the whole
  // cast) in a single update, resetting secondary picks per player exactly
  // like setRole does.
  const assignRoles = useCallback(
    (assignments: Record<string, string | null>) => {
      setGame((prev) => {
        if (!prev) return prev;
        const players = prev.players.map((p) => (p.id in assignments ? withRole(p, assignments[p.id]) : p));
        return { ...prev, players };
      });
    },
    [setGame],
  );

  const setSecondaryRole = useCallback(
    (id: string, index: number, value: string | null) => {
      setGame((prev) =>
        prev
          ? {
              ...prev,
              players: mapPlayer(prev.players, id, (p) => {
                const secondaryIds = [...p.secondaryIds];
                secondaryIds[index] = value;
                return { ...p, secondaryIds };
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

  // Starts the next night (resuming one already in progress instead of
  // creating a duplicate) and returns its number.
  const startNight = useCallback(() => {
    let nightNumber = 1;
    setGame((prev) => {
      if (!prev) return prev;
      const inProgress = prev.nights.find((n) => !n.completed);
      if (inProgress) {
        nightNumber = inProgress.number;
        return prev;
      }
      nightNumber = prev.nights.length + 1;
      const record: NightRecord = { number: nightNumber, actions: {}, executedPlayerId: null, completed: false };
      return { ...prev, nights: [...prev.nights, record] };
    });
    return nightNumber;
  }, [setGame]);

  const recordNightAction = useCallback(
    (nightNumber: number, actingPlayerId: string, targetIds: string[]) => {
      setGame((prev) => {
        if (!prev) return prev;
        const nights = prev.nights.map((n) =>
          n.number === nightNumber ? { ...n, actions: { ...n.actions, [actingPlayerId]: targetIds } } : n,
        );
        return { ...prev, nights };
      });
    },
    [setGame],
  );

  const setNightExecuted = useCallback(
    (nightNumber: number, playerId: string | null) => {
      setGame((prev) => {
        if (!prev) return prev;
        const nights = prev.nights.map((n) => (n.number === nightNumber ? { ...n, executedPlayerId: playerId } : n));
        return { ...prev, nights };
      });
    },
    [setGame],
  );

  const completeNight = useCallback(
    (nightNumber: number) => {
      setGame((prev) => {
        if (!prev) return prev;
        const nights = prev.nights.map((n) => (n.number === nightNumber ? { ...n, completed: true } : n));
        return { ...prev, nights };
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
    assignRoles,
    setSecondaryRole,
    toggleDead,
    toggleDrunk,
    addReminder,
    removeReminder,
    renamePlayer,
    swapSeats,
    movePlayerToGap,
    startNight,
    recordNightAction,
    setNightExecuted,
    completeNight,
  };
}

function removeAt<T>(items: T[], index: number): T[] {
  return items.slice(0, index).concat(items.slice(index + 1));
}
