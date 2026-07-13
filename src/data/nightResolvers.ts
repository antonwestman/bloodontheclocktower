import type { Lang, NightRecord, Player, Team } from "../types";
import type { DisplayRole } from "./scriptRoles";
import type { NightStep } from "./nightOrder";
import { t } from "../i18n";

export interface NightContext {
  night: NightRecord;
  isFirstNight: boolean;
  players: Player[];
  roleById: (id: string | null) => DisplayRole | undefined;
  lang: Lang;
}

export type StepOutcome =
  // Safe to relay to the acting player as-is.
  | { kind: "info"; lines: string[] }
  | { kind: "choose"; count: number; alreadyChosen: string[] }
  // Storyteller-eyes-only: poisoned/fake info needs a made-up line before it
  // can ever be shown to the player, and choose-executed/manual are Storyteller
  // bookkeeping, not something to hand the player a picker for.
  | { kind: "storyteller-note"; lines: string[] }
  | { kind: "choose-executed" }
  | { kind: "none" }
  | { kind: "manual" };

function isEvilTeam(team: Team): boolean {
  return team === "minion" || team === "demon";
}

function aliveNeighbors(players: Player[], playerId: string): [Player | null, Player | null] {
  const index = players.findIndex((p) => p.id === playerId);
  if (index === -1) return [null, null];
  const n = players.length;
  let left: Player | null = null;
  for (let i = 1; i < n; i++) {
    const p = players[(index - i + n) % n];
    if (!p.isDead) {
      left = p;
      break;
    }
  }
  let right: Player | null = null;
  for (let i = 1; i < n; i++) {
    const p = players[(index + i) % n];
    if (!p.isDead) {
      right = p;
      break;
    }
  }
  return [left, right];
}

function countEvilPairs(players: Player[], roleById: NightContext["roleById"]): number {
  let count = 0;
  const n = players.length;
  for (let i = 0; i < n; i++) {
    const a = roleById(players[i].roleId);
    const b = roleById(players[(i + 1) % n].roleId);
    if (a && b && isEvilTeam(a.team) && isEvilTeam(b.team)) count += 1;
  }
  return count;
}

function countEvilNeighbors(players: Player[], player: Player, roleById: NightContext["roleById"]): number {
  const [left, right] = aliveNeighbors(players, player.id);
  return [left, right].filter((p) => p && isEvilTeam(roleById(p.roleId)?.team ?? "townsfolk")).length;
}

function revealTwo(players: Player[], actor: Player, team: Team, ctx: NightContext): StepOutcome {
  const { roleById, lang } = ctx;
  const candidates = players.filter((p) => p.id !== actor.id && roleById(p.roleId)?.team === team);
  if (candidates.length === 0) {
    return { kind: "info", lines: [team === "outsider" ? t(lang, "nightZeroOutsiders") : t(lang, "nightNoValidTarget")] };
  }
  const truePlayer = candidates[Math.floor(Math.random() * candidates.length)];
  const trueRole = roleById(truePlayer.roleId);
  if (!trueRole) return { kind: "info", lines: [t(lang, "nightNoValidTarget")] };
  const decoyPool = players.filter((p) => p.id !== actor.id && p.id !== truePlayer.id);
  if (decoyPool.length === 0) {
    return { kind: "info", lines: [`${truePlayer.name}: ${trueRole.name}`] };
  }
  const decoy = decoyPool[Math.floor(Math.random() * decoyPool.length)];
  const pair = Math.random() < 0.5 ? [truePlayer, decoy] : [decoy, truePlayer];
  return { kind: "info", lines: [`${pair[0].name} ${t(lang, "nightOr")} ${pair[1].name}: ${trueRole.name}`] };
}

// A player is treated as poisoned tonight if the (TB) Poisoner targeted them
// this same night — our one fully-modeled poison source. Other scripts'
// poison-flavoured actions (Pukka, Witch, ...) are recorded but not cross-
// checked here, to keep this to mechanics we're confident about.
function isPoisonedTonight(playerId: string, players: Player[], night: NightRecord): boolean {
  const poisoner = players.find((p) => p.roleId === "poisoner" && !p.isDead);
  if (!poisoner) return false;
  return (night.actions[poisoner.id] ?? []).includes(playerId);
}

function withPoisonCheck(step: NightStep, ctx: NightContext, compute: () => StepOutcome): StepOutcome {
  if (step.player && isPoisonedTonight(step.player.id, ctx.players, ctx.night)) {
    return { kind: "storyteller-note", lines: [t(ctx.lang, "nightPoisonedWarning")] };
  }
  return compute();
}

export function resolveMinionDemonInfo(
  players: Player[],
  allRoles: DisplayRole[],
  roleById: NightContext["roleById"],
  lang: Lang,
): string[] {
  const minions = players.filter((p) => !p.isDead && roleById(p.roleId)?.team === "minion");
  const demons = players.filter((p) => !p.isDead && roleById(p.roleId)?.team === "demon");
  if (minions.length === 0 && demons.length === 0) return [t(lang, "nightNoMinionsOrDemon")];

  const lines: string[] = [];
  if (demons.length > 0) {
    lines.push(`${t(lang, "nightMinionsAre")} ${minions.map((p) => p.name).join(", ") || "—"}`);
  }
  if (minions.length > 0) {
    lines.push(`${t(lang, "nightDemonIs")} ${demons.map((p) => p.name).join(", ") || "—"}`);
  }
  if (demons.length > 0) {
    const usedIds = new Set(players.filter((p) => p.roleId).map((p) => p.roleId));
    const bluffPool = allRoles.filter((r) => !isEvilTeam(r.team) && !usedIds.has(r.id));
    const bluffs = shuffle(bluffPool).slice(0, 3);
    if (bluffs.length > 0) {
      lines.push(`${t(lang, "nightBluffsAre")} ${bluffs.map((r) => r.name).join(", ")}`);
    }
  }
  return lines;
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function resolveFortuneTeller(chosen: string[] | null, step: NightStep, ctx: NightContext): StepOutcome {
  if (!chosen || chosen.length < 2) {
    return { kind: "choose", count: 2, alreadyChosen: chosen ?? [] };
  }
  return withPoisonCheck(step, ctx, () => {
    const isDemon = chosen.some((id) => ctx.roleById(ctx.players.find((p) => p.id === id)?.roleId ?? null)?.team === "demon");
    return { kind: "info", lines: [t(ctx.lang, isDemon ? "nightFortuneTellerYes" : "nightFortuneTellerNo")] };
  });
}

function resolveChoosePlayer(chosen: string[] | null, ctx: NightContext): StepOutcome {
  if (!chosen || chosen.length < 1) {
    return { kind: "choose", count: 1, alreadyChosen: [] };
  }
  const target = ctx.players.find((p) => p.id === chosen[0]);
  return { kind: "info", lines: [`${t(ctx.lang, "nightChosen")}: ${target?.name ?? "?"}`] };
}

function resolveChoosePlayerLearnRole(chosen: string[] | null, ctx: NightContext): StepOutcome {
  if (!chosen || chosen.length < 1) {
    return { kind: "choose", count: 1, alreadyChosen: [] };
  }
  const target = ctx.players.find((p) => p.id === chosen[0]);
  const role = target ? ctx.roleById(target.roleId) : undefined;
  return { kind: "info", lines: [target && role ? `${target.name}: ${role.name}` : t(ctx.lang, "nightNoValidTarget")] };
}

// executedPlayerId: null = not answered yet, NO_EXECUTION_MARKER = answered
// "nobody", any other value = that player's id.
export const NO_EXECUTION_MARKER = "__none__";

function resolveUndertaker(step: NightStep, ctx: NightContext): StepOutcome {
  if (ctx.night.executedPlayerId === null) return { kind: "choose-executed" };
  if (ctx.night.executedPlayerId === NO_EXECUTION_MARKER) {
    return { kind: "info", lines: [t(ctx.lang, "nightNoExecution")] };
  }
  return withPoisonCheck(step, ctx, () => {
    const executed = ctx.players.find((p) => p.id === ctx.night.executedPlayerId);
    const role = executed ? ctx.roleById(executed.roleId) : undefined;
    return { kind: "info", lines: [executed && role ? `${executed.name}: ${role.name}` : t(ctx.lang, "nightNoValidTarget")] };
  });
}

export function resolveStep(step: NightStep, ctx: NightContext): StepOutcome {
  if (!step.player) return { kind: "none" };
  const player = step.player;
  const chosen = ctx.night.actions[player.id] ?? null;

  switch (step.resolver) {
    case "wake-no-action":
      return { kind: "info", lines: [t(ctx.lang, "nightNoActionNeeded")] };

    case "reveal-two-townsfolk":
      return withPoisonCheck(step, ctx, () => revealTwo(ctx.players, player, "townsfolk", ctx));
    case "reveal-two-outsider":
      return withPoisonCheck(step, ctx, () => revealTwo(ctx.players, player, "outsider", ctx));
    case "reveal-two-minion":
      return withPoisonCheck(step, ctx, () => revealTwo(ctx.players, player, "minion", ctx));

    case "count-evil-pairs":
      return withPoisonCheck(step, ctx, () => ({ kind: "info", lines: [String(countEvilPairs(ctx.players, ctx.roleById))] }));

    case "count-evil-neighbors":
      return withPoisonCheck(step, ctx, () => ({
        kind: "info",
        lines: [String(countEvilNeighbors(ctx.players, player, ctx.roleById))],
      }));

    case "fortune-teller":
      return resolveFortuneTeller(chosen, step, ctx);

    case "choose-player":
    case "choose-player-protect":
    case "choose-player-kill":
      return resolveChoosePlayer(chosen, ctx);

    case "choose-player-learn-role":
      return resolveChoosePlayerLearnRole(chosen, ctx);

    case "undertaker":
      return resolveUndertaker(step, ctx);

    case "manual":
    default:
      return { kind: "manual" };
  }
}
