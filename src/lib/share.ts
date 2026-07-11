// Generic "encode a JSON payload into a short shareable URL" plumbing, used
// by both scenario sharing and player-group sharing. Compresses (gzip) then
// base64url-encodes the payload into a URL hash fragment — hashes never
// reach a server, which matters since this app has none.

export function isShareSupported(): boolean {
  return typeof CompressionStream !== "undefined" && typeof DecompressionStream !== "undefined";
}

export async function encodePayload(payload: unknown): Promise<string> {
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  const compressed = await gzip(bytes);
  return bytesToBase64Url(compressed);
}

export async function decodePayload(encoded: string): Promise<unknown | null> {
  try {
    const compressed = base64UrlToBytes(encoded);
    const bytes = await gunzip(compressed);
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function buildShareUrl(key: string, encoded: string): string {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = `${key}=${encoded}`;
  return url.toString();
}

export function readHashParam(key: string): string | null {
  const match = window.location.hash.match(new RegExp(`^#${key}=(.+)$`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function clearHashParam(): void {
  const url = new URL(window.location.href);
  url.hash = "";
  window.history.replaceState(null, "", url.toString());
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
