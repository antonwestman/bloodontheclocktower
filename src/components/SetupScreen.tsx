import { useState } from "react";
import type { Lang, ScriptId } from "../types";
import { SCRIPTS } from "../data/roles";
import { t } from "../i18n";

interface Props {
  lang: Lang;
  onStart: (script: ScriptId, playerNames: string[]) => void;
}

const SCRIPT_IDS = Object.keys(SCRIPTS) as ScriptId[];
const MIN_PLAYERS = 5;

export function SetupScreen({ lang, onStart }: Props) {
  const [script, setScript] = useState<ScriptId>("tb");
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

  return (
    <div className="setup-screen">
      <h1>{t(lang, "appTitle")}</h1>

      <section className="setup-section">
        <h2>{t(lang, "chooseScript")}</h2>
        <div className="script-choices">
          {SCRIPT_IDS.map((id) => (
            <label key={id} className={`script-choice ${script === id ? "selected" : ""}`}>
              <input
                type="radio"
                name="script"
                value={id}
                checked={script === id}
                onChange={() => setScript(id)}
              />
              {SCRIPTS[id]}
            </label>
          ))}
        </div>
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

      <button
        type="button"
        className="primary-button"
        disabled={!canStart}
        onClick={() => onStart(script, names)}
      >
        {t(lang, "startGame")}
      </button>
    </div>
  );
}
