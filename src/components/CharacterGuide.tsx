import { useState } from "react";
import type { Lang } from "../types";
import type { DisplayRole } from "../data/scriptRoles";
import { TEAM_ORDER } from "../data/roles";
import { t, TEAM_LABEL } from "../i18n";

interface Props {
  lang: Lang;
  title: string;
  roles: DisplayRole[];
  onClose?: () => void;
}

// A read-only, player-friendly reference: what does each character in this
// script actually do? Meant to be just as usable standalone (picking a
// script to browse) as via a link shared from an active game's exact roster.
export function CharacterGuide({ lang, title, roles, onClose }: Props) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = normalizedQuery ? roles.filter((r) => r.name.toLowerCase().includes(normalizedQuery)) : roles;

  return (
    <div className="character-guide">
      <div className="character-guide-header">
        <h2>{title}</h2>
        {onClose && (
          <button type="button" className="icon-button" onClick={onClose} aria-label={t(lang, "close")}>
            ×
          </button>
        )}
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t(lang, "characterGuideSearchPlaceholder")}
      />

      {filtered.length === 0 ? (
        <p className="hint">{t(lang, "characterGuideNoMatches")}</p>
      ) : (
        TEAM_ORDER.map((team) => {
          const teamRoles = filtered.filter((r) => r.team === team);
          if (teamRoles.length === 0) return null;
          return (
            <div key={team} className="character-guide-group">
              <h3>{TEAM_LABEL[lang][team]}</h3>
              <ul className="character-guide-list">
                {teamRoles.map((role) => (
                  <li key={role.id} className={`character-guide-row team-${role.team}`}>
                    <span className="character-guide-name">{role.name}</span>
                    <span className="character-guide-ability">{role.ability}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })
      )}
    </div>
  );
}
