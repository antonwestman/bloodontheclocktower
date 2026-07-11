import { useState } from "react";
import type { Lang, PlayerGroup } from "../types";
import { t } from "../i18n";
import { buildGroupShareUrl, encodeGroup, isShareSupported } from "../lib/shareGroup";

interface Props {
  lang: Lang;
  names: string[];
  playerGroups: PlayerGroup[];
  onSaveGroup: (id: string | null, name: string, playerNames: string[]) => string;
  onDeleteGroup: (id: string) => void;
  onLoadGroup: (playerNames: string[]) => void;
}

export function PlayerGroupPicker({ lang, names, playerGroups, onSaveGroup, onDeleteGroup, onLoadGroup }: Props) {
  const [groupName, setGroupName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareCopyFailed, setShareCopyFailed] = useState(false);

  const trimmedNames = names.map((n) => n.trim()).filter(Boolean);

  const loadGroup = (group: PlayerGroup) => {
    setGroupName(group.name);
    setEditingId(group.id);
    setShareUrl(null);
    onLoadGroup(group.playerNames);
  };

  const handleSave = () => {
    const trimmed = groupName.trim();
    if (!trimmed || trimmedNames.length === 0) return;
    const id = onSaveGroup(editingId, trimmed, trimmedNames);
    setEditingId(id);
  };

  const handleDelete = (group: PlayerGroup) => {
    if (!window.confirm(t(lang, "deleteGroupConfirm"))) return;
    onDeleteGroup(group.id);
    if (editingId === group.id) {
      setEditingId(null);
      setGroupName("");
    }
  };

  const handleShare = async () => {
    const encoded = await encodeGroup({ name: groupName.trim() || t(lang, "playerGroups"), playerNames: trimmedNames });
    const url = buildGroupShareUrl(encoded);
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
        <span>{t(lang, "savedPlayerGroups")}</span>
        {playerGroups.length === 0 ? (
          <p className="hint">{t(lang, "noSavedPlayerGroups")}</p>
        ) : (
          <ul className="player-list">
            {playerGroups.map((group) => (
              <li key={group.id}>
                <button type="button" className="link-button" onClick={() => loadGroup(group)}>
                  {group.name} ({group.playerNames.length})
                </button>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => handleDelete(group)}
                  aria-label={t(lang, "deleteGroup")}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="field">
        <span>{t(lang, "groupName")}</span>
        <div className="add-player-form">
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder={t(lang, "groupNamePlaceholder")}
          />
          <button type="button" disabled={!groupName.trim() || trimmedNames.length === 0} onClick={handleSave}>
            {t(lang, "saveGroup")}
          </button>
        </div>
        {editingId && <p className="hint">{t(lang, "savedGroupAs")}: {groupName}</p>}
      </div>

      <div className="field">
        <span>{t(lang, "shareGroup")}</span>
        <div>
          <button
            type="button"
            className="secondary-button"
            disabled={trimmedNames.length === 0 || !isShareSupported()}
            onClick={handleShare}
          >
            {t(lang, "shareGroup")}
          </button>
        </div>
        {!isShareSupported() && <p className="hint">{t(lang, "shareUnsupported")}</p>}
        {isShareSupported() && trimmedNames.length === 0 && <p className="hint">{t(lang, "shareGroupNeedsPlayers")}</p>}
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
