import { useState } from "react";
import type { Lang, Player, ScriptId } from "../types";
import { rolesForScript, TEAM_ORDER } from "../data/roles";
import { t, TEAM_LABEL } from "../i18n";

interface Props {
  player: Player;
  script: ScriptId;
  lang: Lang;
  onClose: () => void;
  onRename: (name: string) => void;
  onSetRole: (roleId: string | null) => void;
  onToggleDead: () => void;
  onToggleDrunk: () => void;
  onAddReminder: (text: string) => void;
  onRemoveReminder: (index: number) => void;
  onRemovePlayer: () => void;
}

export function PlayerPanel({
  player,
  script,
  lang,
  onClose,
  onRename,
  onSetRole,
  onToggleDead,
  onToggleDrunk,
  onAddReminder,
  onRemoveReminder,
  onRemovePlayer,
}: Props) {
  const [name, setName] = useState(player.name);
  const [reminderInput, setReminderInput] = useState("");
  const roles = rolesForScript(script);

  const submitReminder = () => {
    const trimmed = reminderInput.trim();
    if (!trimmed) return;
    onAddReminder(trimmed);
    setReminderInput("");
  };

  return (
    <aside className="player-panel">
      <div className="player-panel-header">
        <h2>{t(lang, "selectedPlayer")}</h2>
        <button type="button" className="icon-button" onClick={onClose} aria-label={t(lang, "close")}>
          ×
        </button>
      </div>

      <label className="field">
        <span>{t(lang, "rename")}</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => name.trim() && onRename(name.trim())}
        />
      </label>

      <label className="field">
        <span>{t(lang, "role")}</span>
        <select value={player.roleId ?? ""} onChange={(e) => onSetRole(e.target.value || null)}>
          <option value="">{t(lang, "noRole")}</option>
          {TEAM_ORDER.map((team) => (
            <optgroup key={team} label={TEAM_LABEL[lang][team]}>
              {roles
                .filter((r) => r.team === team)
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
      </label>

      {player.roleId && (
        <p className="role-ability">
          {roles.find((r) => r.id === player.roleId)?.ability[lang]}
        </p>
      )}

      <div className="status-toggles">
        <label className="checkbox-field">
          <input type="checkbox" checked={player.isDead} onChange={onToggleDead} />
          <span>💀 {t(lang, "dead")}</span>
        </label>
        <label className="checkbox-field">
          <input type="checkbox" checked={player.isDrunk} onChange={onToggleDrunk} />
          <span>🍺 {t(lang, "drunkStatus")}</span>
        </label>
      </div>

      <div className="field">
        <span>{t(lang, "reminders")}</span>
        <form
          className="add-reminder-form"
          onSubmit={(e) => {
            e.preventDefault();
            submitReminder();
          }}
        >
          <input
            type="text"
            value={reminderInput}
            onChange={(e) => setReminderInput(e.target.value)}
            placeholder={t(lang, "reminderPlaceholder")}
          />
          <button type="submit">{t(lang, "addReminder")}</button>
        </form>

        {player.reminders.length === 0 ? (
          <p className="hint">{t(lang, "emptyReminders")}</p>
        ) : (
          <ul className="reminder-list">
            {player.reminders.map((r, i) => (
              <li key={`${r}-${i}`}>
                <span>{r}</span>
                <button type="button" className="icon-button" onClick={() => onRemoveReminder(i)}>
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button type="button" className="danger-button" onClick={onRemovePlayer}>
        {t(lang, "removePlayer")}
      </button>
    </aside>
  );
}
