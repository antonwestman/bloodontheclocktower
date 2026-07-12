import type { Lang, Player } from "../types";
import type { DisplayRole } from "../data/scriptRoles";
import { resolveSecondaryNames } from "../data/scriptRoles";
import { PlayerToken } from "./PlayerToken";
import { GapMarker } from "./GapMarker";

interface Props {
  players: Player[];
  lang: Lang;
  selectedId: string | null;
  swapMode: boolean;
  swapFirstId: string | null;
  roleById: (roleId: string | null) => DisplayRole | undefined;
  onSelect: (id: string) => void;
  onToggleDead: (id: string) => void;
  onToggleDrunk: (id: string) => void;
  onGapSelect: (afterIndex: number) => void;
}

type DensityTier = "cozy" | "compact" | "tight";

// Beyond ~8 players, tokens start crowding each other (especially on narrow
// screens) — shrink them and push them further out toward the edge of the
// circle as the roster grows, instead of a single fixed size for everyone.
function densityTier(playerCount: number): DensityTier {
  if (playerCount <= 8) return "cozy";
  if (playerCount <= 12) return "compact";
  return "tight";
}

const RADIUS_BY_TIER: Record<DensityTier, number> = { cozy: 42, compact: 44, tight: 46 };

function seatAngle(index: number, total: number): number {
  return (2 * Math.PI * index) / total - Math.PI / 2;
}

export function PlayerCircle({
  players,
  lang,
  selectedId,
  swapMode,
  swapFirstId,
  roleById,
  onSelect,
  onToggleDead,
  onToggleDrunk,
  onGapSelect,
}: Props) {
  const n = players.length;
  const tier = densityTier(n);
  const radius = RADIUS_BY_TIER[tier];

  return (
    <div className={`circle-wrapper density-${tier}`}>
      <div className="circle-track" />
      {players.map((player, i) => (
        <PlayerToken
          key={player.id}
          player={player}
          role={roleById(player.roleId)}
          secondaryRoleNames={resolveSecondaryNames(player, players, roleById)}
          lang={lang}
          angle={seatAngle(i, n)}
          radius={radius}
          isSelected={player.id === selectedId}
          swapMode={swapMode}
          isSwapChosen={player.id === swapFirstId}
          onSelect={() => onSelect(player.id)}
          onToggleDead={() => onToggleDead(player.id)}
          onToggleDrunk={() => onToggleDrunk(player.id)}
        />
      ))}
      {swapMode &&
        players.map((player, i) => (
          <GapMarker
            key={`gap-${player.id}`}
            angle={seatAngle(i, n) + Math.PI / n}
            radius={radius}
            lang={lang}
            onClick={() => onGapSelect(i)}
          />
        ))}
    </div>
  );
}
