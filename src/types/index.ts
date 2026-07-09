export type Team = "townsfolk" | "outsider" | "minion" | "demon";

export type ScriptId = "tb" | "bmr" | "sv";

export type Lang = "sv" | "en";

export type LocalizedText = Record<Lang, string>;

export interface Role {
  id: string;
  name: string;
  team: Team;
  script: ScriptId;
  ability: LocalizedText;
}

export interface Player {
  id: string;
  name: string;
  roleId: string | null;
  isDead: boolean;
  isDrunk: boolean;
  reminders: string[];
}

export interface GameState {
  script: ScriptId;
  players: Player[];
  createdAt: number;
}
