import type { Player, Team } from "../types";
import { distributionModifierFor } from "./roles";
import type { DisplayRole } from "./scriptRoles";

export type TeamCounts = Record<Team, number>;

// The official townsfolk/outsider/minion/demon split for a given table size
// (5-15 players is the officially supported range, but the formula holds
// for larger tables too — it's the same scaling rule the game itself uses).
export function baseDistribution(playerCount: number): TeamCounts {
  const n = Math.max(playerCount, 5);
  const demon = 1;
  const minion = 1 + Math.floor(Math.max(0, n - 7) / 3);
  const outsider = n <= 6 ? n - 5 : (n - 7) % 3;
  const townsfolk = n - outsider - minion - demon;
  return { townsfolk, outsider, minion, demon };
}

function addCounts(a: TeamCounts, b: Partial<TeamCounts>): TeamCounts {
  return {
    townsfolk: a.townsfolk + (b.townsfolk ?? 0),
    outsider: a.outsider + (b.outsider ?? 0),
    minion: a.minion + (b.minion ?? 0),
    demon: a.demon + (b.demon ?? 0),
  };
}

// The base split, shifted by any in-play characters that change it
// (e.g. the Baron trades 2 Townsfolk for 2 Outsiders).
export function requiredDistribution(playerCount: number, assignedRoleIds: string[]): TeamCounts {
  return assignedRoleIds.reduce((counts, roleId) => {
    const modifier = distributionModifierFor(roleId);
    return modifier ? addCounts(counts, modifier) : counts;
  }, baseDistribution(playerCount));
}

export function assignedDistribution(players: Player[], roleById: (id: string | null) => DisplayRole | undefined): TeamCounts {
  const counts: TeamCounts = { townsfolk: 0, outsider: 0, minion: 0, demon: 0 };
  for (const player of players) {
    const role = roleById(player.roleId);
    if (role) counts[role.team] += 1;
  }
  return counts;
}
