import type { Lang } from "../types";
import { t } from "../i18n";

export type ImportStatus = "loading" | "invalid" | "ready";

interface Props {
  lang: Lang;
  status: ImportStatus;
  name?: string;
  playerNames?: string[];
  onConfirm: () => void;
  onCancel: () => void;
}

export function ImportGroupModal({ lang, status, name, playerNames, onConfirm, onCancel }: Props) {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>{t(lang, "importGroupTitle")}</h2>

        {status === "loading" && <p className="hint">{t(lang, "importGroupLoading")}</p>}
        {status === "invalid" && <p className="hint">{t(lang, "importGroupInvalid")}</p>}
        {status === "ready" && playerNames && (
          <>
            <p>
              <strong>{name}</strong> · {playerNames.length} {t(lang, "importGroupPlayers")}
            </p>
            <p className="hint">{playerNames.join(", ")}</p>
          </>
        )}

        <div className="picker-actions">
          <button type="button" className="secondary-button" onClick={onCancel}>
            {t(lang, "cancel")}
          </button>
          {status === "ready" && (
            <button type="button" className="primary-button" onClick={onConfirm}>
              {t(lang, "importButton")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
