import type { Lang, Player, Role } from "../types";
import { t } from "../i18n";

interface Props {
  player: Player;
  role: Role | undefined;
  lang: Lang;
  angle: number;
  radius: number;
  isSelected: boolean;
  onSelect: () => void;
  onToggleDead: () => void;
  onToggleDrunk: () => void;
}

export function PlayerToken({ player, role, lang, angle, radius, isSelected, onSelect, onToggleDead, onToggleDrunk }: Props) {
  const x = 50 + radius * Math.cos(angle);
  const y = 50 + radius * Math.sin(angle);

  return (
    <div
      className={`player-token team-${role?.team ?? "none"} ${player.isDead ? "is-dead" : ""} ${isSelected ? "is-selected" : ""}`}
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <button type="button" className="token-avatar" onClick={onSelect}>
        <span className="token-name">{player.name}</span>
        {role && <span className="token-role">{role.name}</span>}
        {player.isDead && <span className="token-badge dead-badge" title={t(lang, "dead")}>💀</span>}
        {player.isDrunk && <span className="token-badge drunk-badge" title={t(lang, "drunkStatus")}>🍺</span>}
      </button>

      <div className="token-toggles">
        <button
          type="button"
          className={`toggle-chip ${player.isDead ? "active" : ""}`}
          onClick={onToggleDead}
          title={t(lang, "dead")}
        >
          💀
        </button>
        <button
          type="button"
          className={`toggle-chip ${player.isDrunk ? "active" : ""}`}
          onClick={onToggleDrunk}
          title={t(lang, "drunkStatus")}
        >
          🍺
        </button>
      </div>

      {player.reminders.length > 0 && (
        <div className="token-reminders">
          {player.reminders.map((r, i) => (
            <span key={`${r}-${i}`} className="reminder-chip">
              {r}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
