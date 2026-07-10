import type { Lang, Player } from "../types";
import type { DisplayRole } from "../data/scriptRoles";
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

const RADIUS = 42;

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

  return (
    <div className="circle-wrapper">
      <div className="circle-track" />
      {players.map((player, i) => (
        <PlayerToken
          key={player.id}
          player={player}
          role={roleById(player.roleId)}
          lang={lang}
          angle={seatAngle(i, n)}
          radius={RADIUS}
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
            radius={RADIUS}
            lang={lang}
            onClick={() => onGapSelect(i)}
          />
        ))}
    </div>
  );
}
