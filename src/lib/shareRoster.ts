import type { Team } from "../types";
import type { DisplayRole } from "../data/scriptRoles";
import { buildShareUrl, clearHashParam, decodePayload, encodePayload, readHashParam } from "./share";

export { isShareSupported } from "./share";

export interface SharedRoster {
  name: string;
  roles: DisplayRole[];
}

const VALID_TEAMS: ReadonlySet<string> = new Set(["townsfolk", "outsider", "minion", "demon"]);
const MAX_ROLES = 150;
const MAX_NAME_LENGTH = 200;
const HASH_KEY = "roles";

export async function encodeRoster(roster: SharedRoster): Promise<string> {
  return encodePayload(roster);
}

export async function decodeRoster(encoded: string): Promise<SharedRoster | null> {
  return validateRoster(await decodePayload(encoded));
}

export function buildRosterShareUrl(encoded: string): string {
  return buildShareUrl(HASH_KEY, encoded);
}

export function readSharedRosterParam(): string | null {
  return readHashParam(HASH_KEY);
}

export function clearSharedRosterParam(): void {
  clearHashParam();
}

function validateRoster(parsed: unknown): SharedRoster | null {
  if (!parsed || typeof parsed !== "object") return null;
  const p = parsed as Record<string, unknown>;
  if (typeof p.name !== "string" || !Array.isArray(p.roles)) return null;

  const roles: DisplayRole[] = [];
  for (const entry of p.roles.slice(0, MAX_ROLES)) {
    if (!entry || typeof entry !== "object") continue;
    const r = entry as Record<string, unknown>;
    if (typeof r.id !== "string" || typeof r.name !== "string" || typeof r.ability !== "string") continue;
    if (typeof r.team !== "string" || !VALID_TEAMS.has(r.team)) continue;
    roles.push({ id: r.id, name: r.name, team: r.team as Team, ability: r.ability });
  }
  if (roles.length === 0) return null;

  return { name: p.name.slice(0, MAX_NAME_LENGTH), roles };
}
