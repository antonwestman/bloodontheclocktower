import { useEffect, useState } from "react";
import { useGame } from "./hooks/useGame";
import { useLang } from "./hooks/useLang";
import { useCustomScripts } from "./hooks/useCustomScripts";
import { usePlayerGroups } from "./hooks/usePlayerGroups";
import { useKnownPlayers } from "./hooks/useKnownPlayers";
import { SetupScreen } from "./components/SetupScreen";
import { PlayerCircle } from "./components/PlayerCircle";
import { PlayerPanel } from "./components/PlayerPanel";
import { ImportScenarioModal } from "./components/ImportScenarioModal";
import type { ImportStatus } from "./components/ImportScenarioModal";
import { ImportGroupModal } from "./components/ImportGroupModal";
import { RoleDistributionStatus } from "./components/RoleDistributionStatus";
import { gameRoles, scriptDisplayName } from "./data/scriptRoles";
import { assignedDistribution, requiredDistribution } from "./data/distribution";
import { randomizeRoleSelection } from "./data/randomize";
import { clearSharedScenarioParam, decodeScenario, readSharedScenarioParam } from "./lib/shareScenario";
import { clearSharedGroupParam, decodeGroup, readSharedGroupParam } from "./lib/shareGroup";
import type { CustomRole, ScriptRef } from "./types";
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
    assignRoles,
    setSecondaryRole,
    toggleDead,
    toggleDrunk,
    addReminder,
    removeReminder,
    renamePlayer,
    swapSeats,
    movePlayerToGap,
  } = useGame();
  const { customScripts, saveScript, deleteScript } = useCustomScripts();
  const { playerGroups, saveGroup, deleteGroup } = usePlayerGroups();
  const { knownPlayers, addKnownPlayers } = useKnownPlayers();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [swapMode, setSwapMode] = useState(false);
  const [swapFirstId, setSwapFirstId] = useState<string | null>(null);
  const [importScenario, setImportScenario] = useState<{
    status: ImportStatus;
    name?: string;
    roles?: CustomRole[];
  } | null>(null);
  const [importGroup, setImportGroup] = useState<{
    status: ImportStatus;
    name?: string;
    playerNames?: string[];
  } | null>(null);

  useEffect(() => {
    const scenarioParam = readSharedScenarioParam();
    if (scenarioParam) {
      setImportScenario({ status: "loading" });
      decodeScenario(scenarioParam).then((result) => {
        setImportScenario(result ? { status: "ready", name: result.name, roles: result.roles } : { status: "invalid" });
      });
    }

    const groupParam = readSharedGroupParam();
    if (groupParam) {
      setImportGroup({ status: "loading" });
      decodeGroup(groupParam).then((result) => {
        setImportGroup(result ? { status: "ready", name: result.name, playerNames: result.playerNames } : { status: "invalid" });
      });
    }
  }, []);

  const handleImportConfirm = () => {
    if (importScenario?.status !== "ready" || !importScenario.name || !importScenario.roles) return;
    saveScript(null, importScenario.name, importScenario.roles);
    clearSharedScenarioParam();
    setImportScenario(null);
  };

  const handleImportCancel = () => {
    clearSharedScenarioParam();
    setImportScenario(null);
  };

  const handleImportGroupConfirm = () => {
    if (importGroup?.status !== "ready" || !importGroup.name || !importGroup.playerNames) return;
    saveGroup(null, importGroup.name, importGroup.playerNames);
    addKnownPlayers(importGroup.playerNames);
    clearSharedGroupParam();
    setImportGroup(null);
  };

  const handleImportGroupCancel = () => {
    clearSharedGroupParam();
    setImportGroup(null);
  };

  const handleStartGame = (script: ScriptRef, playerNames: string[]) => {
    addKnownPlayers(playerNames);
    startGame(script, playerNames);
  };

  const selectedPlayer = game?.players.find((p) => p.id === selectedId) ?? null;
  const activeRoles = game ? gameRoles(game.script, lang) : [];
  const roleById = (roleId: string | null) => activeRoles.find((r) => r.id === roleId);
  const assignedRoleIds = game ? game.players.map((p) => p.roleId).filter((id): id is string => id !== null) : [];
  const required = game ? requiredDistribution(game.players.length, assignedRoleIds) : null;
  const assigned = game ? assignedDistribution(game.players, roleById) : null;

  const handleReset = () => {
    if (window.confirm(t(lang, "resetConfirm"))) {
      endGame();
      setSelectedId(null);
      setSwapMode(false);
      setSwapFirstId(null);
    }
  };

  const toggleSwapMode = () => {
    setSwapMode((prev) => !prev);
    setSwapFirstId(null);
    setSelectedId(null);
  };

  const handleTokenClick = (id: string) => {
    if (!swapMode) {
      setSelectedId(id);
      return;
    }
    if (!swapFirstId) {
      setSwapFirstId(id);
      return;
    }
    if (swapFirstId === id) {
      setSwapFirstId(null);
      return;
    }
    swapSeats(swapFirstId, id);
    setSwapMode(false);
    setSwapFirstId(null);
  };

  const handleGapClick = (afterIndex: number) => {
    if (!swapFirstId) return;
    movePlayerToGap(swapFirstId, afterIndex);
    setSwapMode(false);
    setSwapFirstId(null);
  };

  const handleRandomize = () => {
    if (!game) return;
    const alreadyAssigned = game.players.some((p) => p.roleId !== null);
    if (alreadyAssigned && !window.confirm(t(lang, "randomizeRolesConfirm"))) return;
    const roleIds = randomizeRoleSelection(activeRoles, game.players.length);
    const assignments: Record<string, string | null> = {};
    game.players.forEach((player, i) => {
      assignments[player.id] = roleIds[i] ?? null;
    });
    assignRoles(assignments);
  };

  let circleHint = t(lang, "clickPlayerHint");
  if (swapMode) {
    circleHint = t(lang, swapFirstId ? "swapHintPickSecond" : "swapHintPickFirst");
  }

  return (
    <div className="app">
      {importScenario && (
        <ImportScenarioModal
          lang={lang}
          status={importScenario.status}
          name={importScenario.name}
          roleCount={importScenario.roles?.length}
          onConfirm={handleImportConfirm}
          onCancel={handleImportCancel}
        />
      )}
      {importGroup && (
        <ImportGroupModal
          lang={lang}
          status={importGroup.status}
          name={importGroup.name}
          playerNames={importGroup.playerNames}
          onConfirm={handleImportGroupConfirm}
          onCancel={handleImportGroupCancel}
        />
      )}
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
            <button
              type="button"
              className={`secondary-button ${swapMode ? "active" : ""}`}
              onClick={toggleSwapMode}
            >
              {t(lang, swapMode ? "swapCancel" : "swapSeats")}
            </button>
          )}
          {game && (
            <button
              type="button"
              className="secondary-button"
              disabled={activeRoles.length === 0}
              onClick={handleRandomize}
            >
              {t(lang, "randomizeRoles")}
            </button>
          )}
          {game && (
            <button type="button" className="secondary-button" onClick={handleReset}>
              {t(lang, "resetGame")}
            </button>
          )}
        </div>
      </header>

      {!game ? (
        <SetupScreen
          lang={lang}
          customScripts={customScripts}
          onSaveScript={saveScript}
          onDeleteScript={deleteScript}
          playerGroups={playerGroups}
          onSaveGroup={saveGroup}
          onDeleteGroup={deleteGroup}
          knownPlayers={knownPlayers}
          onStart={handleStartGame}
        />
      ) : (
        <div className="game-layout">
          <div className="game-main">
            <div className="game-toolbar">
              <span className="script-label">{scriptDisplayName(game.script)}</span>
              <form
                className="add-player-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const trimmed = newPlayerName.trim();
                  if (!trimmed) return;
                  addPlayer(trimmed);
                  addKnownPlayers([trimmed]);
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

            {required && assigned && <RoleDistributionStatus lang={lang} required={required} assigned={assigned} />}

            {game.players.length === 0 ? (
              <p className="hint">{t(lang, "needAtLeastPlayers")}</p>
            ) : (
              <>
                <PlayerCircle
                  players={game.players}
                  lang={lang}
                  selectedId={selectedId}
                  swapMode={swapMode}
                  swapFirstId={swapFirstId}
                  roleById={roleById}
                  onSelect={handleTokenClick}
                  onToggleDead={toggleDead}
                  onToggleDrunk={toggleDrunk}
                  onGapSelect={handleGapClick}
                />
                <p className="hint centered">{circleHint}</p>
              </>
            )}
          </div>

          {selectedPlayer && (
            <PlayerPanel
              player={selectedPlayer}
              players={game.players}
              roles={activeRoles}
              lang={lang}
              onClose={() => setSelectedId(null)}
              onRename={(name) => renamePlayer(selectedPlayer.id, name)}
              onSetRole={(roleId) => setRole(selectedPlayer.id, roleId)}
              onSetSecondaryRole={(index, roleId) => setSecondaryRole(selectedPlayer.id, index, roleId)}
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
