export type Team = "townsfolk" | "outsider" | "minion" | "demon";

export type BuiltinScriptId = "tb" | "bmr" | "sv";

export type Lang = "sv" | "en";

export type LocalizedText = Record<Lang, string>;

// How a role shifts the standard townsfolk/outsider/minion/demon split when
// it's in play — e.g. the Baron adds 2 Outsiders (at the cost of 2 Townsfolk).
export type DistributionModifier = Partial<Record<Team, number>>;

export interface Role {
  id: string;
  name: string;
  team: Team;
  script: BuiltinScriptId;
  ability: LocalizedText;
  distributionModifier?: DistributionModifier;
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

export interface Player {
  id: string;
  name: string;
  roleId: string | null;
  isDead: boolean;
  isDrunk: boolean;
  reminders: string[];
}

export interface GameState {
  script: ScriptRef;
  players: Player[];
  createdAt: number;
}
