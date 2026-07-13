import type { NightResolverId, Player } from "../types";
import { roleById as officialRoleById } from "./roles";

export interface NightStep {
  key: string;
  player: Player | null; // null for whole-table synthetic steps (e.g. minion/demon acquaintance)
  roleId: string;
  roleName: string;
  resolver: NightResolverId | "minion-demon-info";
  isFake: boolean; // Drunk/Lunatic acting on a believed role — info should be made up, not trusted
}

const SPECIAL_BELIEVER_ROLE_IDS = new Set(["drunk", "lunatic"]);

// Canonical wake order per script. A single combined list works for both
// first and other nights: each night's filter (firstNight/otherNights on
// the role's nightBehavior) drops whichever roles don't act that night, and
// the ones that remain stay in this relative order. Roles not listed here
// (or from a custom/experimental scenario) sort after everything listed.
const NIGHT_ORDER_PRIORITY: Record<string, string[]> = {
  tb: [
    "poisoner", "washerwoman", "librarian", "investigator", "chef",
    "monk", "imp", "ravenkeeper", "undertaker",
    "empath", "fortune-teller", "butler", "spy",
  ],
  bmr: [
    "pukka", "grandmother", "sailor", "chambermaid", "exorcist", "innkeeper",
    "gambler", "courtier", "professor", "devils-advocate", "assassin",
    "godfather", "zombuul", "shabaloth", "po",
  ],
  sv: [
    "witch", "dreamer", "snake-charmer", "mathematician", "clockmaker",
    "seamstress", "philosopher", "juggler", "evil-twin", "cerenovus",
    "pit-hag", "flowergirl", "town-crier", "oracle",
    "fang-gu", "vigormortis", "no-dashii", "vortox",
  ],
};

function priorityIndex(roleId: string, script: string | undefined): number {
  const list = (script && NIGHT_ORDER_PRIORITY[script]) || [];
  const index = list.indexOf(roleId);
  return index === -1 ? list.length : index;
}

function believedRoleIdFor(player: Player): string | null {
  // Both Drunk (slot 0: belief) and Lunatic (slot 0: belief, slots 1-2: bluffs)
  // keep their own believed identity in the first secondary slot.
  return player.secondaryIds[0] ?? null;
}

function hasEvilInPlay(players: Player[]): boolean {
  return players.some((p) => {
    if (p.isDead || !p.roleId) return false;
    const role = officialRoleById(p.roleId);
    return role && (role.team === "minion" || role.team === "demon");
  });
}

// Builds the ordered list of who wakes on a given night, for the roles we
// have known mechanics for (the three base scripts). Experimental and
// custom-scenario roles aren't included — the Night Guide surfaces them
// separately as a reminder instead of guessing at an order.
export function buildNightOrder(players: Player[], isFirstNight: boolean): NightStep[] {
  const entries: { step: NightStep; priority: number }[] = [];

  if (isFirstNight && hasEvilInPlay(players)) {
    entries.push({
      step: { key: "synthetic-minion-demon-info", player: null, roleId: "", roleName: "", resolver: "minion-demon-info", isFake: false },
      priority: -1,
    });
  }

  for (const player of players) {
    if (player.isDead || !player.roleId) continue;
    const official = officialRoleById(player.roleId);
    if (!official) continue;

    if (SPECIAL_BELIEVER_ROLE_IDS.has(official.id)) {
      const believed = believedRoleIdFor(player);
      const believedRole = believed ? officialRoleById(believed) : undefined;
      const behavior = believedRole?.nightBehavior;
      if (behavior && believedRole && (isFirstNight ? behavior.firstNight : behavior.otherNights)) {
        entries.push({
          step: { key: player.id, player, roleId: official.id, roleName: official.name, resolver: behavior.resolver, isFake: true },
          priority: priorityIndex(believedRole.id, believedRole.script),
        });
      }
      continue;
    }

    const behavior = official.nightBehavior;
    if (!behavior) continue;
    if (!(isFirstNight ? behavior.firstNight : behavior.otherNights)) continue;
    entries.push({
      step: { key: player.id, player, roleId: official.id, roleName: official.name, resolver: behavior.resolver, isFake: false },
      priority: priorityIndex(official.id, official.script),
    });
  }

  return entries
    .map((entry, originalIndex) => ({ ...entry, originalIndex }))
    .sort((a, b) => a.priority - b.priority || a.originalIndex - b.originalIndex)
    .map((entry) => entry.step);
}

// Roles that are in play but have no known night behavior at all (neither a
// real one nor via a Drunk/Lunatic belief) — shown as a manual reminder list
// so the Storyteller doesn't forget about them.
export function rolesWithoutNightData(players: Player[]): string[] {
  const names: string[] = [];
  for (const player of players) {
    if (player.isDead || !player.roleId) continue;
    const official = officialRoleById(player.roleId);
    if (!official) {
      names.push(player.name);
      continue;
    }
    if (SPECIAL_BELIEVER_ROLE_IDS.has(official.id)) continue;
    if (!official.nightBehavior) names.push(`${player.name} (${official.name})`);
  }
  return names;
}

export function isRavenkeeper(roleId: string | null): boolean {
  return roleId === "ravenkeeper";
}
