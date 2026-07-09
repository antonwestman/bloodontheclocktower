import type { Lang, Player, Role } from "../types";
import { PlayerToken } from "./PlayerToken";

interface Props {
  players: Player[];
  lang: Lang;
  selectedId: string | null;
  roleById: (roleId: string | null) => Role | undefined;
  onSelect: (id: string) => void;
  onToggleDead: (id: string) => void;
  onToggleDrunk: (id: string) => void;
}

const RADIUS = 42;

export function PlayerCircle({ players, lang, selectedId, roleById, onSelect, onToggleDead, onToggleDrunk }: Props) {
  return (
    <div className="circle-wrapper">
      <div className="circle-track" />
      {players.map((player, i) => {
        const angle = (2 * Math.PI * i) / players.length - Math.PI / 2;
        return (
          <PlayerToken
            key={player.id}
            player={player}
            role={roleById(player.roleId)}
            lang={lang}
            angle={angle}
            radius={RADIUS}
            isSelected={player.id === selectedId}
            onSelect={() => onSelect(player.id)}
            onToggleDead={() => onToggleDead(player.id)}
            onToggleDrunk={() => onToggleDrunk(player.id)}
          />
        );
      })}
    </div>
  );
}
