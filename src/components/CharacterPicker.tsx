import { useState } from "react";
import type { CustomRole, Lang, Team } from "../types";
import { ROLES, SCRIPTS, TEAM_ORDER } from "../data/roles";
import { t, TEAM_LABEL } from "../i18n";

interface Props {
  lang: Lang;
  excludeIds: string[];
  submitLabel: string;
  onPick: (role: CustomRole) => void;
  onCancel: () => void;
}

type Tab = "catalog" | "create";

export function CharacterPicker({ lang, excludeIds, submitLabel, onPick, onCancel }: Props) {
  const [tab, setTab] = useState<Tab>("catalog");
  const [catalogId, setCatalogId] = useState("");
  const [name, setName] = useState("");
  const [team, setTeam] = useState<Team>("townsfolk");
  const [ability, setAbility] = useState("");

  const available = ROLES.filter((r) => !excludeIds.includes(r.id));

  const submitCatalog = () => {
    const role = available.find((r) => r.id === catalogId);
    if (!role) return;
    onPick({ id: role.id, name: role.name, team: role.team, ability: role.ability[lang] });
  };

  const submitCreate = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    onPick({ id: `custom-${crypto.randomUUID()}`, name: trimmedName, team, ability: ability.trim() });
    setName("");
    setAbility("");
  };

  return (
    <div className="character-picker">
      <div className="picker-tabs">
        <button type="button" className={tab === "catalog" ? "active" : ""} onClick={() => setTab("catalog")}>
          {t(lang, "fromCatalog")}
        </button>
        <button type="button" className={tab === "create" ? "active" : ""} onClick={() => setTab("create")}>
          {t(lang, "createNewCharacter")}
        </button>
      </div>

      {tab === "catalog" ? (
        <div className="picker-body">
          {available.length === 0 ? (
            <p className="hint">{t(lang, "noCatalogRoles")}</p>
          ) : (
            <label className="field">
              <span>{t(lang, "pickCharacter")}</span>
              <select value={catalogId} onChange={(e) => setCatalogId(e.target.value)}>
                <option value="" disabled>
                  {t(lang, "pickCharacter")}
                </option>
                {TEAM_ORDER.map((teamId) => (
                  <optgroup key={teamId} label={TEAM_LABEL[lang][teamId]}>
                    {available
                      .filter((r) => r.team === teamId)
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({SCRIPTS[r.script]})
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </label>
          )}
          <div className="picker-actions">
            <button type="button" className="secondary-button" onClick={onCancel}>
              {t(lang, "cancel")}
            </button>
            <button type="button" className="primary-button" disabled={!catalogId} onClick={submitCatalog}>
              {submitLabel}
            </button>
          </div>
        </div>
      ) : (
        <div className="picker-body">
          <label className="field">
            <span>{t(lang, "characterName")}</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t(lang, "characterNamePlaceholder")}
            />
          </label>
          <label className="field">
            <span>{t(lang, "characterTeam")}</span>
            <select value={team} onChange={(e) => setTeam(e.target.value as Team)}>
              {TEAM_ORDER.map((teamId) => (
                <option key={teamId} value={teamId}>
                  {TEAM_LABEL[lang][teamId]}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{t(lang, "characterAbility")}</span>
            <textarea
              value={ability}
              onChange={(e) => setAbility(e.target.value)}
              placeholder={t(lang, "characterAbilityPlaceholder")}
              rows={3}
            />
          </label>
          <div className="picker-actions">
            <button type="button" className="secondary-button" onClick={onCancel}>
              {t(lang, "cancel")}
            </button>
            <button type="button" className="primary-button" disabled={!name.trim()} onClick={submitCreate}>
              {submitLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
