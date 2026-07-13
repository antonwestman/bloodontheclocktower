import { useState } from "react";
import type { Lang, Player } from "../types";
import type { DisplayRole } from "../data/scriptRoles";
import { PlayerRevealView } from "./PlayerRevealView";
import { t } from "../i18n";

interface Props {
  lang: Lang;
  players: Player[];
  revealedPlayerIds: string[];
  roleById: (id: string | null) => DisplayRole | undefined;
  onMarkRevealed: (playerId: string) => void;
  onClose: () => void;
}

// Walks through every player with a role assigned (not just the ones who
// wake at night) so everyone gets a chance to privately see "you are X" —
// reusing the same isolated, single-player view as the Night Guide.
export function RoleRevealGuide({ lang, players, revealedPlayerIds, roleById, onMarkRevealed, onClose }: Props) {
  const withRoles = players.filter((p) => p.roleId);
  const [stepIndex, setStepIndex] = useState(0);
  const [showingPlayer, setShowingPlayer] = useState(false);

  const player = withRoles[stepIndex];
  const role = player ? roleById(player.roleId) : undefined;
  const isRevealed = player ? revealedPlayerIds.includes(player.id) : false;

  if (withRoles.length === 0) {
    return (
      <div className="night-guide">
        <div className="night-guide-header">
          <h2>{t(lang, "revealRolesTitle")}</h2>
        </div>
        <p className="hint">{t(lang, "revealRolesNoPlayers")}</p>
        <div className="picker-actions">
          <button type="button" className="primary-button" onClick={onClose}>
            {t(lang, "close")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="night-guide">
        <div className="night-guide-header">
          <h2>{t(lang, "revealRolesTitle")}</h2>
          <span className="night-guide-counter">
            {stepIndex + 1} {t(lang, "nightStepCounter")} {withRoles.length}
          </span>
        </div>

        <div className="night-guide-step">
          <div className="night-guide-player">
            <span className="night-guide-player-name">{player.name}</span>
            <span className="night-guide-role-name">{role?.name ?? "?"}</span>
            {isRevealed && <span className="reveal-checkmark">✓ {t(lang, "revealRolesShown")}</span>}
          </div>
          <p className="role-ability">{role?.ability}</p>

          <button type="button" className="secondary-button" onClick={() => setShowingPlayer(true)}>
            📱 {t(lang, "nightShowToPlayer")}
          </button>
        </div>

        <div className="picker-actions night-guide-nav">
          <button type="button" className="secondary-button" onClick={onClose}>
            {t(lang, "close")}
          </button>
          <button type="button" className="secondary-button" disabled={stepIndex === 0} onClick={() => setStepIndex((i) => i - 1)}>
            {t(lang, "nightPrevious")}
          </button>
          {stepIndex + 1 < withRoles.length ? (
            <button type="button" className="primary-button" onClick={() => setStepIndex((i) => i + 1)}>
              {t(lang, "nightNext")}
            </button>
          ) : (
            <button type="button" className="primary-button" onClick={onClose}>
              {t(lang, "nightFinish")}
            </button>
          )}
        </div>
      </div>

      {showingPlayer && role && (
        <PlayerRevealView
          lang={lang}
          player={player}
          roleName={role.name}
          ability={role.ability}
          content={{ mode: "info", text: role.ability }}
          players={players}
          onConfirmChoice={() => {}}
          onDone={() => {
            onMarkRevealed(player.id);
            setShowingPlayer(false);
          }}
        />
      )}
    </>
  );
}
