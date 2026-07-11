import { useEffect, useState } from "react";
import type { BuiltinScriptId, CustomRole, CustomScript, Lang } from "../types";
import { rolesForScript, SCRIPTS, TEAM_ORDER } from "../data/roles";
import { t, TEAM_LABEL } from "../i18n";
import { CharacterPicker } from "./CharacterPicker";
import { buildScenarioShareUrl, encodeScenario, isShareSupported } from "../lib/shareScenario";

interface Props {
  lang: Lang;
  customScripts: CustomScript[];
  onSaveScript: (id: string | null, name: string, roles: CustomRole[]) => string;
  onDeleteScript: (id: string) => void;
  onDraftChange: (draft: { name: string; roles: CustomRole[] }) => void;
}

type PickerMode = { mode: "add" } | { mode: "replace"; index: number } | null;

const BUILTIN_IDS = Object.keys(SCRIPTS) as BuiltinScriptId[];

export function ScriptBuilder({ lang, customScripts, onSaveScript, onDeleteScript, onDraftChange }: Props) {
  const [name, setName] = useState("");
  const [roles, setRoles] = useState<CustomRole[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [picker, setPicker] = useState<PickerMode>(null);
  const [includeExperimental, setIncludeExperimental] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareCopyFailed, setShareCopyFailed] = useState(false);

  useEffect(() => {
    onDraftChange({ name, roles });
  }, [name, roles, onDraftChange]);

  const startFromEmpty = () => {
    setName("");
    setRoles([]);
    setEditingId(null);
  };

  const startFromBuiltin = (id: BuiltinScriptId) => {
    setName("");
    setRoles(rolesForScript(id).map((r) => ({ id: r.id, name: r.name, team: r.team, ability: r.ability[lang] })));
    setEditingId(null);
  };

  const startFromSaved = (script: CustomScript) => {
    setName(script.name);
    setRoles(script.roles.map((r) => ({ ...r })));
    setEditingId(script.id);
  };

  const addRole = (role: CustomRole) => {
    setRoles((prev) => [...prev, role]);
    setPicker(null);
  };

  const replaceRole = (index: number, role: CustomRole) => {
    setRoles((prev) => prev.map((r, i) => (i === index ? role : r)));
    setPicker(null);
  };

  const removeRole = (index: number) => {
    setRoles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = onSaveScript(editingId, trimmed, roles);
    setEditingId(id);
  };

  const handleDelete = (script: CustomScript) => {
    if (!window.confirm(t(lang, "deleteScenarioConfirm"))) return;
    onDeleteScript(script.id);
    if (editingId === script.id) {
      startFromEmpty();
    }
  };

  const handleShare = async () => {
    const encoded = await encodeScenario({ name: name.trim() || t(lang, "customScenario"), roles });
    const url = buildScenarioShareUrl(encoded);
    setShareUrl(url);
    setShareCopyFailed(false);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      setShareCopyFailed(true);
    }
  };

  return (
    <div className="script-builder">
      <div className="field">
        <span>{t(lang, "startFrom")}</span>
        <div className="start-from-choices">
          <button type="button" onClick={startFromEmpty}>
            {t(lang, "startEmpty")}
          </button>
          {BUILTIN_IDS.map((id) => (
            <button type="button" key={id} onClick={() => startFromBuiltin(id)}>
              {SCRIPTS[id]}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <span>{t(lang, "savedScenarios")}</span>
        {customScripts.length === 0 ? (
          <p className="hint">{t(lang, "noSavedScenarios")}</p>
        ) : (
          <ul className="player-list">
            {customScripts.map((script) => (
              <li key={script.id}>
                <button type="button" className="link-button" onClick={() => startFromSaved(script)}>
                  {script.name} ({script.roles.length})
                </button>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => handleDelete(script)}
                  aria-label={t(lang, "deleteScenario")}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="field">
        <span>{t(lang, "scenarioRoster")}</span>
        {roles.length === 0 ? (
          <p className="hint">{t(lang, "noCharactersYet")}</p>
        ) : (
          <ul className="roster-list">
            {TEAM_ORDER.map((teamId) =>
              roles
                .map((role, index) => ({ role, index }))
                .filter(({ role }) => role.team === teamId)
                .map(({ role, index }) => (
                  <li key={role.id} className={`roster-row team-${role.team}`}>
                    <div className="roster-row-info">
                      <span className="roster-row-team">{TEAM_LABEL[lang][role.team]}</span>
                      <span className="roster-row-name">{role.name}</span>
                    </div>
                    <div className="roster-row-actions">
                      <button type="button" onClick={() => setPicker({ mode: "replace", index })}>
                        {t(lang, "replaceCharacter")}
                      </button>
                      <button type="button" className="icon-button" onClick={() => removeRole(index)} aria-label={t(lang, "removeCharacter")}>
                        ×
                      </button>
                    </div>
                  </li>
                )),
            )}
          </ul>
        )}

        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={includeExperimental}
            onChange={(e) => setIncludeExperimental(e.target.checked)}
          />
          <span>{t(lang, "includeExperimentalRoles")}</span>
        </label>
        <p className="hint">{t(lang, "includeExperimentalRolesHint")}</p>

        {picker ? (
          <CharacterPicker
            lang={lang}
            excludeIds={roles.map((r) => r.id)}
            submitLabel={t(lang, picker.mode === "replace" ? "replaceCharacter" : "addCharacter")}
            includeExperimental={includeExperimental}
            onPick={(role) => (picker.mode === "replace" ? replaceRole(picker.index, role) : addRole(role))}
            onCancel={() => setPicker(null)}
          />
        ) : (
          <button type="button" className="secondary-button" onClick={() => setPicker({ mode: "add" })}>
            {t(lang, "addCharacter")}
          </button>
        )}
      </div>

      <div className="field">
        <span>{t(lang, "scenarioName")}</span>
        <div className="add-player-form">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t(lang, "scenarioNamePlaceholder")}
          />
          <button type="button" disabled={!name.trim()} onClick={handleSave}>
            {t(lang, "saveScenario")}
          </button>
        </div>
        {editingId && <p className="hint">{t(lang, "savedAs")}: {name}</p>}
      </div>

      <div className="field">
        <span>{t(lang, "shareScenario")}</span>
        <div>
          <button
            type="button"
            className="secondary-button"
            disabled={roles.length === 0 || !isShareSupported()}
            onClick={handleShare}
          >
            {t(lang, "shareScenario")}
          </button>
        </div>
        {!isShareSupported() && <p className="hint">{t(lang, "shareUnsupported")}</p>}
        {isShareSupported() && roles.length === 0 && <p className="hint">{t(lang, "shareNeedsRoles")}</p>}
        {shareUrl && (
          <>
            <input type="text" readOnly value={shareUrl} onFocus={(e) => e.currentTarget.select()} />
            <p className="hint">{t(lang, shareCopyFailed ? "shareLinkCopyFailed" : "shareLinkCopied")}</p>
          </>
        )}
      </div>
    </div>
  );
}
