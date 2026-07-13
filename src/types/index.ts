export type Team = "townsfolk" | "outsider" | "minion" | "demon";

export type BuiltinScriptId = "tb" | "bmr" | "sv";

// Roles tagged "experimental" don't belong to any of the three base scripts —
// they're catalog entries only available when building a custom scenario
// with the "include experimental roles" toggle on.
export type RoleScriptTag = BuiltinScriptId | "experimental";

export type Lang = "sv" | "en";

export type LocalizedText = Record<Lang, string>;

// How a role shifts the standard townsfolk/outsider/minion/demon split when
// it's in play — e.g. the Baron adds 2 Outsiders (at the cost of 2 Townsfolk).
export type DistributionModifier = Partial<Record<Team, number>>;

// A role that believes it's something else, or is told fake information
// about other players — e.g. the Drunk thinks it's a specific Townsfolk
// (kind: "role"), while the Lunatic is shown 2 players it's told are the
// Minions (kind: "player"). `count` is how many pickers to show.
export interface SecondaryRoleSlot {
  id: string;
  kind: "role" | "player";
  team?: Team; // required when kind is "role"
  count: number;
  label: LocalizedText;
}

// Identifies which computation the Night Guide runs for a role's turn. Only
// defined for the three base scripts' roles, where the mechanic is known
// precisely enough to automate — experimental and custom-scenario roles
// fall back to a plain ability-text reminder instead.
export type NightResolverId =
  | "minion-demon-info"
  | "reveal-two-townsfolk"
  | "reveal-two-outsider"
  | "reveal-two-minion"
  | "count-evil-pairs"
  | "count-evil-neighbors"
  | "fortune-teller"
  | "choose-player"
  | "choose-player-protect"
  | "choose-player-kill"
  | "undertaker"
  | "choose-player-learn-role"
  | "wake-no-action"
  | "manual";

export interface NightBehavior {
  firstNight: boolean;
  otherNights: boolean;
  resolver: NightResolverId;
}

export interface Role {
  id: string;
  name: string;
  team: Team;
  script: RoleScriptTag;
  ability: LocalizedText;
  distributionModifier?: DistributionModifier;
  secondaryRoleSlots?: SecondaryRoleSlot[];
  nightBehavior?: NightBehavior;
}

// A role inside a custom scenario. Ability text is plain (not localized) —
// it's either authored by the user, or frozen from an official role's text
// in whichever language was active when it was added.
export interface CustomRole {
  id: string;
  name: string;
  team: Team;
  ability: string;
}

export interface CustomScript {
  id: string;
  name: string;
  roles: CustomRole[];
  createdAt: number;
  updatedAt: number;
}

// What script a game is running. Builtin scripts resolve their role list
// live (so ability text stays bilingual). Custom scripts carry a frozen
// snapshot of their roles, so a started game keeps working even if the
// saved scenario it came from is later edited or deleted.
export type ScriptRef =
  | { kind: "builtin"; id: BuiltinScriptId }
  | { kind: "custom"; id: string; name: string; roles: CustomRole[] };

// A saved, reusable set of people who often play together.
export interface PlayerGroup {
  id: string;
  name: string;
  playerNames: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Player {
  id: string;
  name: string;
  roleId: string | null;
  isDead: boolean;
  isDrunk: boolean;
  reminders: string[];
  // Flat list of secondary picks (role ids or player ids, depending on the
  // slot's kind), positionally matching the assigned role's flattened
  // secondaryRoleSlots.
  secondaryIds: (string | null)[];
}

// One night's worth of recorded Storyteller actions. `actions` is keyed by
// the *acting* player's id -> the player id(s) they targeted (poison,
// protect, kill, choose, ...), so later steps (same night or future nights)
// can look up what happened. `executedPlayerId` is entered manually the
// first time it's needed (e.g. by the Undertaker) since day-phase actions
// aren't tracked by the app yet.
export interface NightRecord {
  number: number;
  actions: Record<string, string[]>;
  executedPlayerId: string | null;
  completed: boolean;
}

export interface GameState {
  script: ScriptRef;
  players: Player[];
  createdAt: number;
  nights: NightRecord[];
}
