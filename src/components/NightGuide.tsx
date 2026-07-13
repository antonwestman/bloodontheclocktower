import { useState } from "react";
import type { Lang, NightRecord, Player } from "../types";
import type { DisplayRole } from "../data/scriptRoles";
import { buildNightOrder, isRavenkeeper, rolesWithoutNightData } from "../data/nightOrder";
import type { NightStep } from "../data/nightOrder";
import { NO_EXECUTION_MARKER, resolveMinionDemonInfo, resolveStep } from "../data/nightResolvers";
import type { NightContext, StepOutcome } from "../data/nightResolvers";
import { roleById as officialRoleById } from "../data/roles";
import { PlayerRevealView } from "./PlayerRevealView";
import type { PlayerRevealContent } from "./PlayerRevealView";
import { t } from "../i18n";

interface Props {
  lang: Lang;
  night: NightRecord;
  players: Player[];
  roles: DisplayRole[];
  roleById: (id: string | null) => DisplayRole | undefined;
  onRecordAction: (actingPlayerId: string, targetIds: string[]) => void;
  onSetExecuted: (playerId: string) => void;
  onToggleDead: (playerId: string) => void;
  onFinish: () => void;
  onClose: () => void;
}

const RAVENKEEPER_ROLE = officialRoleById("ravenkeeper");

export function NightGuide({
  lang,
  night,
  players,
  roles,
  roleById,
  onRecordAction,
  onSetExecuted,
  onToggleDead,
  onFinish,
  onClose,
}: Props) {
  const isFirstNight = night.number === 1;
  const ctx: NightContext = { night, isFirstNight, players, roleById, lang };

  const [steps, setSteps] = useState<NightStep[]>(() => buildNightOrder(players, isFirstNight));
  const [stepIndex, setStepIndex] = useState(0);
  const [cache, setCache] = useState<Record<string, StepOutcome>>(() => {
    const first = steps[0];
    if (first?.player) {
      const outcome = resolveStep(first, ctx);
      if (outcome.kind === "info") return { [first.key]: outcome };
    }
    return {};
  });
  const [pendingChoice, setPendingChoice] = useState<string[]>([]);
  const [playerView, setPlayerView] = useState<PlayerRevealContent | null>(null);
  const [overrideDraft, setOverrideDraft] = useState<string | null>(null);

  const step = steps[stepIndex];
  const missingRoles = rolesWithoutNightData(players);

  const cacheOutcome = (s: NightStep) => {
    if (!s.player || cache[s.key]) return;
    const outcome = resolveStep(s, ctx);
    if (outcome.kind === "info") {
      setCache((prev) => ({ ...prev, [s.key]: outcome }));
    }
  };

  const goToIndex = (index: number) => {
    const target = steps[index];
    if (target) cacheOutcome(target);
    setPendingChoice([]);
    setPlayerView(null);
    setOverrideDraft(null);
    setStepIndex(index);
  };

  const handleConfirmChoice = () => {
    if (!step?.player) return;
    onRecordAction(step.player.id, pendingChoice);
    setPendingChoice([]);
  };

  const handleShowToPlayer = (currentOutcome: StepOutcome) => {
    if (currentOutcome.kind === "info") {
      setPlayerView({ mode: "info", text: currentOutcome.lines.join(" ") });
    } else if (currentOutcome.kind === "choose") {
      setPlayerView({ mode: "choose", count: currentOutcome.count });
    } else {
      setOverrideDraft("");
    }
  };

  const handlePlayerViewChoice = (targetIds: string[]) => {
    if (!step?.player) return;
    onRecordAction(step.player.id, targetIds);
  };

  const handleMarkDead = (target: Player) => {
    onToggleDead(target.id);
    if (isRavenkeeper(target.roleId) && !target.isDead) {
      const newStep: NightStep = {
        key: `ravenkeeper-${target.id}`,
        player: target,
        roleId: "ravenkeeper",
        roleName: RAVENKEEPER_ROLE?.name ?? "Ravenkeeper",
        resolver: "choose-player-learn-role",
        isFake: false,
      };
      setSteps((prev) => {
        const next = [...prev];
        next.splice(stepIndex + 1, 0, newStep);
        return next;
      });
    }
  };

  if (steps.length === 0) {
    return (
      <div className="night-guide">
        <div className="night-guide-header">
          <h2>
            {t(lang, "nightNumberLabel")} {night.number}
          </h2>
        </div>
        <p className="hint">{t(lang, "nightNoOneWakes")}</p>
        <div className="picker-actions">
          <button type="button" className="secondary-button" onClick={onClose}>
            {t(lang, "close")}
          </button>
          <button type="button" className="primary-button" onClick={onFinish}>
            {t(lang, "nightFinish")}
          </button>
        </div>
      </div>
    );
  }

  let outcome: StepOutcome | null = null;
  if (step?.player) {
    outcome = step.isFake ? { kind: "storyteller-note", lines: [t(lang, "nightFakeWarning")] } : (cache[step.key] ?? resolveStep(step, ctx));
  }

  const canShowDirectly = outcome?.kind === "info" || outcome?.kind === "choose";
  const needsOverrideText = outcome?.kind === "storyteller-note" || outcome?.kind === "manual";

  return (
    <>
    <div className="night-guide">
      <div className="night-guide-header">
        <h2>
          {t(lang, "nightNumberLabel")} {night.number}
        </h2>
        <span className="night-guide-counter">
          {stepIndex + 1} {t(lang, "nightStepCounter")} {steps.length}
        </span>
      </div>

      {missingRoles.length > 0 && (
        <p className="hint night-guide-missing">
          {t(lang, "nightRolesWithoutData")} {missingRoles.join(", ")}
        </p>
      )}

      <div className="night-guide-step">
        {!step.player ? (
          <>
            <h3>{t(lang, "nightMinionDemonInfoTitle")}</h3>
            <ul className="night-guide-info-lines">
              {resolveMinionDemonInfo(players, roles, roleById, lang).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <div className="night-guide-player">
              <span className="night-guide-player-name">{step.player.name}</span>
              <span className="night-guide-role-name">{step.roleName}</span>
            </div>
            <p className="role-ability">{roleById(step.roleId)?.ability}</p>

            {outcome?.kind === "info" && (
              <ul className="night-guide-info-lines">
                {outcome.lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            )}

            {outcome?.kind === "storyteller-note" && (
              <ul className="night-guide-info-lines night-guide-note">
                {outcome.lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            )}

            {outcome?.kind === "manual" && <p className="hint">{t(lang, "nightManualHint")}</p>}

            {outcome?.kind === "choose" && (
              <div className="night-guide-choice">
                {Array.from({ length: outcome.count }, (_, i) => (
                  <select
                    key={i}
                    value={pendingChoice[i] ?? ""}
                    onChange={(e) =>
                      setPendingChoice((prev) => {
                        const next = [...prev];
                        next[i] = e.target.value;
                        return next;
                      })
                    }
                  >
                    <option value="">{t(lang, outcome.count > 1 ? "nightChooseTwoPlayers" : "nightChoosePlayer")}</option>
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
                  disabled={pendingChoice.filter(Boolean).length < outcome.count}
                  onClick={handleConfirmChoice}
                >
                  {t(lang, "nightConfirm")}
                </button>
              </div>
            )}

            {outcome?.kind === "choose-executed" && (
              <div className="night-guide-choice">
                <select onChange={(e) => onSetExecuted(e.target.value)} defaultValue="">
                  <option value="" disabled>
                    {t(lang, "nightWhoExecuted")}
                  </option>
                  <option value={NO_EXECUTION_MARKER}>{t(lang, "nightNoExecutionOption")}</option>
                  {players.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {step.resolver === "choose-player-kill" && outcome?.kind === "info" && night.actions[step.player.id]?.[0] && (
              <MarkDeadButton
                lang={lang}
                players={players}
                targetId={night.actions[step.player.id][0]}
                onMarkDead={handleMarkDead}
              />
            )}

            {(canShowDirectly || needsOverrideText) && overrideDraft === null && (
              <button type="button" className="secondary-button" onClick={() => outcome && handleShowToPlayer(outcome)}>
                📱 {t(lang, "nightShowToPlayer")}
              </button>
            )}

            {overrideDraft !== null && (
              <div className="night-guide-override">
                <span>{t(lang, "nightShowToPlayerPreview")}</span>
                <textarea
                  value={overrideDraft}
                  onChange={(e) => setOverrideDraft(e.target.value)}
                  placeholder={t(lang, "nightShowToPlayerPlaceholder")}
                  rows={2}
                />
                <div className="picker-actions">
                  <button type="button" className="secondary-button" onClick={() => setOverrideDraft(null)}>
                    {t(lang, "cancel")}
                  </button>
                  <button
                    type="button"
                    className="primary-button"
                    disabled={!overrideDraft.trim()}
                    onClick={() => {
                      setPlayerView({ mode: "info", text: overrideDraft.trim() });
                      setOverrideDraft(null);
                    }}
                  >
                    {t(lang, "nightShowNow")}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="picker-actions night-guide-nav">
        <button type="button" className="secondary-button" onClick={onClose}>
          {t(lang, "close")}
        </button>
        <button type="button" className="secondary-button" disabled={stepIndex === 0} onClick={() => goToIndex(stepIndex - 1)}>
          {t(lang, "nightPrevious")}
        </button>
        {stepIndex + 1 < steps.length ? (
          <button type="button" className="primary-button" onClick={() => goToIndex(stepIndex + 1)}>
            {t(lang, "nightNext")}
          </button>
        ) : (
          <button type="button" className="primary-button" onClick={onFinish}>
            {t(lang, "nightFinish")}
          </button>
        )}
      </div>
    </div>
    {playerView && step?.player && (
      <PlayerRevealView
        lang={lang}
        player={step.player}
        roleName={step.roleName}
        ability={roleById(step.roleId)?.ability ?? ""}
        content={playerView}
        players={players}
        onConfirmChoice={handlePlayerViewChoice}
        onDone={() => setPlayerView(null)}
      />
    )}
    </>
  );
}

function MarkDeadButton({
  lang,
  players,
  targetId,
  onMarkDead,
}: {
  lang: Lang;
  players: Player[];
  targetId: string;
  onMarkDead: (target: Player) => void;
}) {
  const target = players.find((p) => p.id === targetId);
  if (!target || target.isDead) return null;
  return (
    <button type="button" className="danger-button" onClick={() => onMarkDead(target)}>
      💀 {t(lang, "nightMarkDead")}: {target.name}
    </button>
  );
}
