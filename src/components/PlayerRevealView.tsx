import { useState } from "react";
import type { Lang, Player } from "../types";
import { t } from "../i18n";

export type PlayerRevealContent = { mode: "info"; text: string } | { mode: "choose"; count: number };

interface Props {
  lang: Lang;
  player: Player;
  roleName: string;
  ability: string;
  content: PlayerRevealContent;
  players: Player[];
  onConfirmChoice: (targetIds: string[]) => void;
  onDone: () => void;
}

// A full-screen, single-player view meant to be handed to the acting player
// directly — it shows nothing about any other player's role, status, or turn,
// and offers no navigation to the rest of the night.
export function PlayerRevealView({ lang, player, roleName, ability, content, players, onConfirmChoice, onDone }: Props) {
  const [picked, setPicked] = useState<string[]>([]);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    onConfirmChoice(picked);
    setConfirmed(true);
  };

  return (
    <div className="player-reveal-overlay">
      <div className="player-reveal-box">
        <span className="night-guide-player-name">{player.name}</span>
        <span className="night-guide-role-name">{roleName}</span>
        <p className="role-ability">{ability}</p>

        {content.mode === "info" && <p className="player-reveal-text">{content.text}</p>}

        {content.mode === "choose" && !confirmed && (
          <div className="night-guide-choice player-reveal-choice">
            {Array.from({ length: content.count }, (_, i) => (
              <select
                key={i}
                value={picked[i] ?? ""}
                onChange={(e) =>
                  setPicked((prev) => {
                    const next = [...prev];
                    next[i] = e.target.value;
                    return next;
                  })
                }
              >
                <option value="">{t(lang, content.count > 1 ? "nightChooseTwoPlayers" : "nightChoosePlayer")}</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            ))}
            <button
              type="button"
              className="primary-button"
              disabled={picked.filter(Boolean).length < content.count}
              onClick={handleConfirm}
            >
              {t(lang, "nightConfirm")}
            </button>
          </div>
        )}

        {content.mode === "choose" && confirmed && <p className="player-reveal-text">{t(lang, "nightPlayerChoiceRecorded")}</p>}

        {(content.mode === "info" || confirmed) && (
          <button type="button" className="primary-button" onClick={onDone}>
            {t(lang, "nightPlayerDone")}
          </button>
        )}
      </div>
    </div>
  );
}
