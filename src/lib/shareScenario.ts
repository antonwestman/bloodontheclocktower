import type { CustomRole, Team } from "../types";

export interface SharedScenario {
  name: string;
  roles: CustomRole[];
}

const VALID_TEAMS: ReadonlySet<string> = new Set(["townsfolk", "outsider", "minion", "demon"]);
const MAX_ROLES = 100;
const MAX_NAME_LENGTH = 200;

export function isShareSupported(): boolean {
  return typeof CompressionStream !== "undefined" && typeof DecompressionStream !== "undefined";
}

export async function encodeScenario(scenario: SharedScenario): Promise<string> {
  const json = JSON.stringify(scenario);
  const bytes = new TextEncoder().encode(json);
  const compressed = await gzip(bytes);
  return bytesToBase64Url(compressed);
}

export async function decodeScenario(encoded: string): Promise<SharedScenario | null> {
  try {
    const compressed = base64UrlToBytes(encoded);
    const bytes = await gunzip(compressed);
    const json = new TextDecoder().decode(bytes);
    return validateScenario(JSON.parse(json));
  } catch {
    return null;
  }
}

export function buildShareUrl(encoded: string): string {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = `scenario=${encoded}`;
  return url.toString();
}

export function readSharedScenarioParam(): string | null {
  const match = window.location.hash.match(/^#scenario=(.+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function clearSharedScenarioParam(): void {
  const url = new URL(window.location.href);
  url.hash = "";
  window.history.replaceState(null, "", url.toString());
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

function toArrayBuffer(data: Uint8Array): ArrayBuffer {
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
}

async function gzip(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([toArrayBuffer(data)]).stream().pipeThrough(new CompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function gunzip(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([toArrayBuffer(data)]).stream().pipeThrough(new DecompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
