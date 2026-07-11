import { buildShareUrl, clearHashParam, decodePayload, encodePayload, readHashParam } from "./share";

export { isShareSupported } from "./share";

export interface SharedGroup {
  name: string;
  playerNames: string[];
}

const MAX_PLAYERS = 100;
const MAX_NAME_LENGTH = 200;
const HASH_KEY = "group";

export async function encodeGroup(group: SharedGroup): Promise<string> {
  return encodePayload(group);
}

export async function decodeGroup(encoded: string): Promise<SharedGroup | null> {
  return validateGroup(await decodePayload(encoded));
}

export function buildGroupShareUrl(encoded: string): string {
  return buildShareUrl(HASH_KEY, encoded);
}

export function readSharedGroupParam(): string | null {
  return readHashParam(HASH_KEY);
}

export function clearSharedGroupParam(): void {
  clearHashParam();
}

function validateGroup(parsed: unknown): SharedGroup | null {
  if (!parsed || typeof parsed !== "object") return null;
  const p = parsed as Record<string, unknown>;
  if (typeof p.name !== "string" || !Array.isArray(p.playerNames)) return null;

  const playerNames: string[] = [];
  for (const entry of p.playerNames.slice(0, MAX_PLAYERS)) {
    if (typeof entry !== "string") continue;
    const trimmed = entry.trim().slice(0, MAX_NAME_LENGTH);
    if (trimmed) playerNames.push(trimmed);
  }
  if (playerNames.length === 0) return null;

  return { name: p.name.slice(0, MAX_NAME_LENGTH), playerNames };
}
