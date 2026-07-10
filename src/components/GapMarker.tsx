import type { Lang } from "../types";
import { t } from "../i18n";

interface Props {
  angle: number;
  radius: number;
  lang: Lang;
  onClick: () => void;
}

export function GapMarker({ angle, radius, lang, onClick }: Props) {
  const x = 50 + radius * Math.cos(angle);
  const y = 50 + radius * Math.sin(angle);

  return (
    <button
      type="button"
      className="gap-marker"
      style={{ left: `${x}%`, top: `${y}%` }}
      onClick={onClick}
      aria-label={t(lang, "moveHere")}
    />
  );
}
