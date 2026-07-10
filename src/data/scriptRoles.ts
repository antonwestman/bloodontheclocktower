import type { CustomRole, Lang, Player, ScriptRef, Team } from "../types";
import { rolesForScript, SCRIPTS, secondaryRoleSlotsFor } from "./roles";

export interface DisplayRole {
  id: string;
  name: string;
  team: Team;
  ability: string;
}

export function gameRoles(script: ScriptRef, lang: Lang): DisplayRole[] {
  if (script.kind === "builtin") {
    return rolesForScript(script.id).map((r) => ({ id: r.id, name: r.name, team: r.team, ability: r.ability[lang] }));
  }
  return (script.roles ?? []).map((r) => ({ id: r.id, name: r.name, team: r.team, ability: r.ability }));
}

export function scriptDisplayName(script: ScriptRef): string {
  return script.kind === "builtin" ? SCRIPTS[script.id] : script.name;
}

export function officialRoleToCustomRole(role: DisplayRole): CustomRole {
  return { id: role.id, name: role.name, team: role.team, ability: role.ability };
}

interface FlatSecondarySlot {
  index: number;
  kind: "role" | "player";
}

function flattenSecondarySlots(roleId: string | null): FlatSecondarySlot[] {
  const flat: FlatSecondarySlot[] = [];
  let index = 0;
  for (const slot of secondaryRoleSlotsFor(roleId)) {
    for (let i = 0; i < slot.count; i++) {
      flat.push({ index, kind: slot.kind });
      index += 1;
    }
  }
  return flat;
}

// Resolves a player's secondary picks (e.g. Drunk's believed Townsfolk, or
// Lunatic's two fake Minion players) to display names, using the right
// lookup per slot: role catalog for "role" slots, other players for "player" slots.
export function resolveSecondaryNames(
  player: Player,
  allPlayers: Player[],
  roleById: (id: string | null) => DisplayRole | undefined,
): string[] {
  const names: string[] = [];
  for (const { index, kind } of flattenSecondarySlots(player.roleId)) {
    const value = player.secondaryIds[index] ?? null;
    if (!value) continue;
    const name = kind === "player" ? allPlayers.find((p) => p.id === value)?.name : roleById(value)?.name;
    if (name) names.push(name);
  }
  return names;
}
