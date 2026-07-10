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

export function SetupScreen({ lang, customScripts, onSaveScript, onDeleteScript, onStart }: Props) {
  const [choice, setChoice] = useState<ScriptChoice>("tb");
  const [customDraft, setCustomDraft] = useState<{ name: string; roles: CustomRole[] }>({ name: "", roles: [] });
  const [names, setNames] = useState<string[]>([]);
  const [nameInput, setNameInput] = useState("");

  const addName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setNames((prev) => [...prev, trimmed]);
    setNameInput("");
  };

  const removeName = (index: number) => {
    setNames((prev) => prev.slice(0, index).concat(prev.slice(index + 1)));
  };

  const canStart = names.length >= MIN_PLAYERS;

  const handleStart = () => {
    const script: ScriptRef =
      choice === "custom"
        ? { kind: "custom", id: crypto.randomUUID(), name: customDraft.name || t(lang, "customScenario"), roles: customDraft.roles }
        : { kind: "builtin", id: choice };
    onStart(script, names);
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
        <h2>{t(lang, "players")}</h2>
        <form
          className="add-player-form"
          onSubmit={(e) => {
            e.preventDefault();
            addName();
          }}
        >
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder={t(lang, "playerNamePlaceholder")}
            autoFocus
          />
          <button type="submit">{t(lang, "add")}</button>
        </form>

        <ul className="player-list">
          {names.map((name, i) => (
            <li key={`${name}-${i}`}>
              <span>{name}</span>
              <button
                type="button"
                className="icon-button"
                onClick={() => removeName(i)}
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
