import type { Lang, Team } from "./types";

type Dict = Record<string, string>;

const sv: Dict = {
  appTitle: "Blood on the Clocktower – Följeslagare",
  newGame: "Nytt spel",
  startGame: "Starta spel",
  resetGame: "Avsluta spel",
  resetConfirm: "Avsluta det pågående spelet? Detta går inte att ångra.",
  chooseScript: "Välj script",
  players: "Spelare",
  addPlayer: "Lägg till spelare",
  playerNamePlaceholder: "Spelarens namn",
  add: "Lägg till",
  needAtLeastPlayers: "Lägg till minst 5 spelare för att starta.",
  removePlayer: "Ta bort spelare",
  role: "Roll",
  noRole: "Ingen roll vald",
  chooseRole: "Välj roll",
  dead: "Död",
  drunkStatus: "Full",
  reminders: "Reminder-tokens",
  addReminder: "Lägg till token",
  reminderPlaceholder: "T.ex. Poisoned",
  close: "Stäng",
  selectedPlayer: "Vald spelare",
  clickPlayerHint: "Klicka på en spelare i cirkeln för att redigera roll och reminder-tokens.",
  townsfolk: "Townsfolk",
  outsider: "Outsider",
  minion: "Minion",
  demon: "Demon",
  language: "Språk",
  rename: "Byt namn",
  seatCount: "spelare",
  emptyReminders: "Inga tokens",
  swapSeats: "Byt plats",
  swapCancel: "Avbryt bytet",
  swapHintPickFirst: "Välj den första spelaren du vill byta plats på.",
  swapHintPickSecond: "Välj vem den ska byta plats med, eller en tom plats mellan två spelare.",
  moveHere: "Flytta hit",
};

const en: Dict = {
  appTitle: "Blood on the Clocktower Companion",
  newGame: "New game",
  startGame: "Start game",
  resetGame: "End game",
  resetConfirm: "End the current game? This cannot be undone.",
  chooseScript: "Choose script",
  players: "Players",
  addPlayer: "Add player",
  playerNamePlaceholder: "Player name",
  add: "Add",
  needAtLeastPlayers: "Add at least 5 players to start.",
  removePlayer: "Remove player",
  role: "Role",
  noRole: "No role assigned",
  chooseRole: "Choose role",
  dead: "Dead",
  drunkStatus: "Drunk",
  reminders: "Reminder tokens",
  addReminder: "Add token",
  reminderPlaceholder: "e.g. Poisoned",
  close: "Close",
  selectedPlayer: "Selected player",
  clickPlayerHint: "Click a player in the circle to edit role and reminder tokens.",
  townsfolk: "Townsfolk",
  outsider: "Outsider",
  minion: "Minion",
  demon: "Demon",
  language: "Language",
  rename: "Rename",
  seatCount: "players",
  emptyReminders: "No tokens",
  swapSeats: "Swap seats",
  swapCancel: "Cancel swap",
  swapHintPickFirst: "Choose the first player you want to swap.",
  swapHintPickSecond: "Choose who they should swap places with, or an empty spot between two players.",
  moveHere: "Move here",
};

const dictionaries: Record<Lang, Dict> = { sv, en };

export function t(lang: Lang, key: keyof typeof sv): string {
  return dictionaries[lang][key] ?? key;
}

export const TEAM_LABEL: Record<Lang, Record<Team, string>> = {
  sv: { townsfolk: "Townsfolk", outsider: "Outsider", minion: "Minion", demon: "Demon" },
  en: { townsfolk: "Townsfolk", outsider: "Outsider", minion: "Minion", demon: "Demon" },
};
