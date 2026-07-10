import type { Lang } from "../types";
import { t } from "../i18n";

export type ImportStatus = "loading" | "invalid" | "ready";

interface Props {
  lang: Lang;
  status: ImportStatus;
  name?: string;
  roleCount?: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ImportScenarioModal({ lang, status, name, roleCount, onConfirm, onCancel }: Props) {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>{t(lang, "importScenarioTitle")}</h2>

        {status === "loading" && <p className="hint">{t(lang, "importScenarioLoading")}</p>}
        {status === "invalid" && <p className="hint">{t(lang, "importScenarioInvalid")}</p>}
        {status === "ready" && (
          <p>
            <strong>{name}</strong> · {roleCount} {t(lang, "importScenarioCharacters")}
          </p>
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
