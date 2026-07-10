import type { CustomRole, Lang, ScriptRef, Team } from "../types";
import { rolesForScript, SCRIPTS } from "./roles";

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
