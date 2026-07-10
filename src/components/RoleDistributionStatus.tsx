import type { Lang } from "../types";
import type { TeamCounts } from "../data/distribution";
import { TEAM_ORDER } from "../data/roles";
import { t, TEAM_LABEL } from "../i18n";

interface Props {
  lang: Lang;
  required: TeamCounts;
  assigned: TeamCounts;
}

export function RoleDistributionStatus({ lang, required, assigned }: Props) {
  const allSatisfied = TEAM_ORDER.every((team) => assigned[team] === required[team]);

  return (
    <div className="distribution-status">
      <div className="distribution-rows">
        {TEAM_ORDER.map((team) => {
          const need = required[team];
          const have = assigned[team];
          const state = have === need ? "ok" : have < need ? "under" : "over";
          return (
            <div key={team} className={`distribution-row state-${state}`}>
              <span className="distribution-team">{TEAM_LABEL[lang][team]}</span>
              <span className="distribution-count">
                {have}/{need}
              </span>
              <span className="distribution-icon" aria-hidden="true">
                {state === "ok" ? "✓" : state === "under" ? "▲" : "!"}
              </span>
            </div>
          );
        })}
      </div>
      <p className={`distribution-summary ${allSatisfied ? "satisfied" : ""}`}>
        {t(lang, allSatisfied ? "distributionSatisfied" : "distributionUnsatisfied")}
      </p>
    </div>
  );
}
