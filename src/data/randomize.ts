import type { Team } from "../types";
import type { DisplayRole } from "./scriptRoles";
import { TEAM_ORDER } from "./roles";
import { baseDistribution, requiredDistribution, type TeamCounts } from "./distribution";

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickN<T>(pool: T[], n: number): T[] {
  return shuffle(pool).slice(0, Math.max(0, n));
}

function groupByTeam(roles: DisplayRole[]): Record<Team, DisplayRole[]> {
  const byTeam: Record<Team, DisplayRole[]> = { townsfolk: [], outsider: [], minion: [], demon: [] };
  for (const role of roles) byTeam[role.team].push(role);
  return byTeam;
}

function pickForTarget(byTeam: Record<Team, DisplayRole[]>, target: TeamCounts): Record<Team, DisplayRole[]> {
  return {
    townsfolk: pickN(byTeam.townsfolk, target.townsfolk),
    outsider: pickN(byTeam.outsider, target.outsider),
    minion: pickN(byTeam.minion, target.minion),
    demon: pickN(byTeam.demon, target.demon),
  };
}

// Randomly casts `playerCount` characters from `roles`, matching the official
// Townsfolk/Outsider/Minion/Demon split for that table size — including a
// rebalancing pass for characters that shift the split themselves (e.g. the
// Baron trades Townsfolk for Outsiders). Returns fewer ids than playerCount
// if the roster doesn't have enough characters of some team to fill it.
export function randomizeRoleSelection(roles: DisplayRole[], playerCount: number): string[] {
  const byTeam = groupByTeam(roles);
  const target = baseDistribution(playerCount);
  let picked = pickForTarget(byTeam, target);

  const pickedIds = () => TEAM_ORDER.flatMap((team) => picked[team]).map((r) => r.id);
  const adjustedTarget = requiredDistribution(playerCount, pickedIds());

  for (const team of TEAM_ORDER) {
    const need = adjustedTarget[team];
    const have = picked[team];
    if (have.length > need) {
      picked = { ...picked, [team]: shuffle(have).slice(0, need) };
    } else if (have.length < need) {
      const usedIds = new Set(have.map((r) => r.id));
      const remainingPool = byTeam[team].filter((r) => !usedIds.has(r.id));
      picked = { ...picked, [team]: [...have, ...pickN(remainingPool, need - have.length)] };
    }
  }

  return shuffle(pickedIds());
}
