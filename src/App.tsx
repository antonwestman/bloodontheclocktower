import { useState } from "react";
import { useGame } from "./hooks/useGame";
import { useLang } from "./hooks/useLang";
import { SetupScreen } from "./components/SetupScreen";
import { PlayerCircle } from "./components/PlayerCircle";
import { PlayerPanel } from "./components/PlayerPanel";
import { SCRIPTS, roleById } from "./data/roles";
import { t } from "./i18n";

function App() {
  const [lang, setLang] = useLang();
  const {
    game,
    startGame,
    endGame,
    addPlayer,
    removePlayer,
    setRole,
    toggleDead,
    toggleDrunk,
    addReminder,
    removeReminder,
    renamePlayer,
  } = useGame();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newPlayerName, setNewPlayerName] = useState("");

  const selectedPlayer = game?.players.find((p) => p.id === selectedId) ?? null;

  const handleReset = () => {
    if (window.confirm(t(lang, "resetConfirm"))) {
      endGame();
      setSelectedId(null);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>{t(lang, "appTitle")}</h1>
        <div className="header-controls">
          <fieldset className="lang-toggle">
            <legend className="visually-hidden">{t(lang, "language")}</legend>
            <button type="button" className={lang === "sv" ? "active" : ""} onClick={() => setLang("sv")}>
              SV
            </button>
            <button type="button" className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>
              EN
            </button>
          </fieldset>
          {game && (
            <button type="button" className="secondary-button" onClick={handleReset}>
              {t(lang, "resetGame")}
            </button>
          )}
        </div>
      </header>

      {!game ? (
        <SetupScreen lang={lang} onStart={startGame} />
      ) : (
        <div className="game-layout">
          <div className="game-main">
            <div className="game-toolbar">
              <span className="script-label">{SCRIPTS[game.script]}</span>
              <form
                className="add-player-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const trimmed = newPlayerName.trim();
                  if (!trimmed) return;
                  addPlayer(trimmed);
                  setNewPlayerName("");
                }}
              >
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder={t(lang, "playerNamePlaceholder")}
                />
                <button type="submit">{t(lang, "addPlayer")}</button>
              </form>
            </div>

            {game.players.length === 0 ? (
              <p className="hint">{t(lang, "needAtLeastPlayers")}</p>
            ) : (
              <>
                <PlayerCircle
                  players={game.players}
                  lang={lang}
                  selectedId={selectedId}
                  roleById={roleById}
                  onSelect={setSelectedId}
                  onToggleDead={toggleDead}
                  onToggleDrunk={toggleDrunk}
                />
                <p className="hint centered">{t(lang, "clickPlayerHint")}</p>
              </>
            )}
          </div>

          {selectedPlayer && (
            <PlayerPanel
              player={selectedPlayer}
              script={game.script}
              lang={lang}
              onClose={() => setSelectedId(null)}
              onRename={(name) => renamePlayer(selectedPlayer.id, name)}
              onSetRole={(roleId) => setRole(selectedPlayer.id, roleId)}
              onToggleDead={() => toggleDead(selectedPlayer.id)}
              onToggleDrunk={() => toggleDrunk(selectedPlayer.id)}
              onAddReminder={(text) => addReminder(selectedPlayer.id, text)}
              onRemoveReminder={(index) => removeReminder(selectedPlayer.id, index)}
              onRemovePlayer={() => {
                removePlayer(selectedPlayer.id);
                setSelectedId(null);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default App;
