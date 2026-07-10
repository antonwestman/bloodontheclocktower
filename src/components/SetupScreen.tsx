import { useState } from "react";
import type { BuiltinScriptId, CustomRole, CustomScript, Lang, ScriptRef } from "../types";
import { SCRIPTS } from "../data/roles";
import { t } from "../i18n";
import { ScriptBuilder } from "./ScriptBuilder";

interface Props {
  lang: Lang;
  customScripts: CustomScript[];
  onSaveScript: (id: string | null, name: string, roles: CustomRole[]) => string;
  onDeleteScript: (id: string) => void;
  onStart: (script: ScriptRef, playerNames: string[]) => void;
}

type ScriptChoice = BuiltinScriptId | "custom";

const BUILTIN_IDS = Object.keys(SCRIPTS) as BuiltinScriptId[];
const MIN_PLAYERS = 5;
const MAX_PLAYERS = 15;
const PLAYER_COUNTS = Array.from({ length: MAX_PLAYERS - MIN_PLAYERS + 1 }, (_, i) => MIN_PLAYERS + i);

export function SetupScreen({ lang, customScripts, onSaveScript, onDeleteScript, onStart }: Props) {
  const [choice, setChoice] = useState<ScriptChoice>("tb");
  const [customDraft, setCustomDraft] = useState<{ name: string; roles: CustomRole[] }>({ name: "", roles: [] });
  const [names, setNames] = useState<string[]>(new Array(MIN_PLAYERS).fill(""));

  const setPlayerCount = (count: number) => {
    setNames((prev) => {
      const next = prev.slice(0, count);
      while (next.length < count) next.push("");
      return next;
    });
  };

  const updateName = (index: number, value: string) => {
    setNames((prev) => prev.map((n, i) => (i === index ? value : n)));
  };

  const removeSlot = (index: number) => {
    setNames((prev) => (prev.length > MIN_PLAYERS ? prev.filter((_, i) => i !== index) : prev));
  };

  const canStart = names.every((n) => n.trim().length > 0);

  const handleStart = () => {
    const script: ScriptRef =
      choice === "custom"
        ? { kind: "custom", id: crypto.randomUUID(), name: customDraft.name || t(lang, "customScenario"), roles: customDraft.roles }
        : { kind: "builtin", id: choice };
    onStart(script, names.map((n) => n.trim()));
  };

  return (
    <div className="setup-screen">
      <h1>{t(lang, "appTitle")}</h1>

      <section className="setup-section">
        <h2>{t(lang, "chooseScript")}</h2>
        <div className="script-choices">
          {BUILTIN_IDS.map((id) => (
            <label key={id} className={`script-choice ${choice === id ? "selected" : ""}`}>
              <input type="radio" name="script" value={id} checked={choice === id} onChange={() => setChoice(id)} />
              {SCRIPTS[id]}
            </label>
          ))}
          <label className={`script-choice ${choice === "custom" ? "selected" : ""}`}>
            <input
              type="radio"
              name="script"
              value="custom"
              checked={choice === "custom"}
              onChange={() => setChoice("custom")}
            />
            {t(lang, "customScenario")}
          </label>
        </div>

        {choice === "custom" && (
          <ScriptBuilder
            lang={lang}
            customScripts={customScripts}
            onSaveScript={onSaveScript}
            onDeleteScript={onDeleteScript}
            onDraftChange={setCustomDraft}
          />
        )}
      </section>

      <section className="setup-section">
        <h2>{t(lang, "numberOfPlayers")}</h2>
        <div className="start-from-choices">
          {PLAYER_COUNTS.map((count) => (
            <button
              type="button"
              key={count}
              className={names.length === count ? "selected" : ""}
              onClick={() => setPlayerCount(count)}
            >
              {count}
            </button>
          ))}
        </div>
      </section>

      <section className="setup-section">
        <h2>{t(lang, "players")}</h2>
        <ul className="player-list">
          {names.map((name, i) => (
            <li key={i}>
              <span className="player-slot-index">{i + 1}</span>
              <input
                type="text"
                value={name}
                onChange={(e) => updateName(i, e.target.value)}
                placeholder={`${t(lang, "playerSlotPlaceholder")} ${i + 1}`}
                autoFocus={i === 0}
              />
              <button
                type="button"
                className="icon-button"
                onClick={() => removeSlot(i)}
                disabled={names.length <= MIN_PLAYERS}
                aria-label={t(lang, "removePlayer")}
              >
                ×
              </button>
            </li>
          ))}
        </ul>

        {!canStart && <p className="hint">{t(lang, "needAtLeastPlayers")}</p>}
      </section>

      <button type="button" className="primary-button" disabled={!canStart} onClick={handleStart}>
        {t(lang, "startGame")}
      </button>
    </div>
  );
}
