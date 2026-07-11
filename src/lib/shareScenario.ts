import type { CustomRole, Team } from "../types";
import { buildShareUrl, clearHashParam, decodePayload, encodePayload, readHashParam } from "./share";

export { isShareSupported } from "./share";

export interface SharedScenario {
  name: string;
  roles: CustomRole[];
}

const VALID_TEAMS: ReadonlySet<string> = new Set(["townsfolk", "outsider", "minion", "demon"]);
const MAX_ROLES = 100;
const MAX_NAME_LENGTH = 200;
const HASH_KEY = "scenario";

export async function encodeScenario(scenario: SharedScenario): Promise<string> {
  return encodePayload(scenario);
}

export async function decodeScenario(encoded: string): Promise<SharedScenario | null> {
  return validateScenario(await decodePayload(encoded));
}

export function buildScenarioShareUrl(encoded: string): string {
  return buildShareUrl(HASH_KEY, encoded);
}

export function readSharedScenarioParam(): string | null {
  return readHashParam(HASH_KEY);
}

export function clearSharedScenarioParam(): void {
  clearHashParam();
}

function validateScenario(parsed: unknown): SharedScenario | null {
  if (!parsed || typeof parsed !== "object") return null;
  const p = parsed as Record<string, unknown>;
  if (typeof p.name !== "string" || !Array.isArray(p.roles)) return null;

  const roles: CustomRole[] = [];
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
