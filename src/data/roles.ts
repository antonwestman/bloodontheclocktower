import type { BuiltinScriptId, Role } from "../types";

// Förmågetexterna nedan är korta, egna sammanfattningar av de officiella
// rollerna i Blood on the Clocktower – inte ordagrant citerade från spelet.
// Dubbelkolla exakt ordalydelse mot officiella scriptkort vid behov.
//
// Ability texts below are short, original summaries of the official
// Blood on the Clocktower roles — not verbatim quotes from the game.
// Double-check exact wording against official script sheets if needed.

export const SCRIPTS: Record<BuiltinScriptId, string> = {
  tb: "Trouble Brewing",
  bmr: "Bad Moon Rising",
  sv: "Sects & Violets",
};

export const ROLES: Role[] = [
  // ---------------------------------------------------------------------
  // Trouble Brewing
  // ---------------------------------------------------------------------
  { id: "washerwoman", name: "Washerwoman", team: "townsfolk", script: "tb", ability: {
    sv: "Du får natt 1 veta att en av två spelare har en specifik Townsfolk-roll.",
    en: "You start knowing that 1 of 2 players is a particular Townsfolk.",
  }},
  { id: "librarian", name: "Librarian", team: "townsfolk", script: "tb", ability: {
    sv: "Du får natt 1 veta att en av två spelare har en specifik Outsider-roll (eller att ingen Outsider är med).",
    en: "You start knowing that 1 of 2 players is a particular Outsider (or that zero are in play).",
  }},
  { id: "investigator", name: "Investigator", team: "townsfolk", script: "tb", ability: {
    sv: "Du får natt 1 veta att en av två spelare har en specifik Minion-roll.",
    en: "You start knowing that 1 of 2 players is a particular Minion.",
  }},
  { id: "chef", name: "Chef", team: "townsfolk", script: "tb", ability: {
    sv: "Du får natt 1 veta hur många par av onda spelare som sitter bredvid varandra.",
    en: "You start knowing how many pairs of evil players are sitting next to each other.",
  }},
  { id: "empath", name: "Empath", team: "townsfolk", script: "tb", ability: {
    sv: "Varje natt får du veta hur många av dina två levande grannar som är onda.",
    en: "Each night, you learn how many of your 2 alive neighbours are evil.",
  }},
  { id: "fortune-teller", name: "Fortune Teller", team: "townsfolk", script: "tb", ability: {
    sv: "Varje natt väljer du två spelare och får veta om någon av dem är Demonen. En god spelare visas alltid felaktigt som Demon.",
    en: "Each night, choose 2 players: you learn if either is the Demon. There is a good player that registers as the Demon.",
  }},
  { id: "undertaker", name: "Undertaker", team: "townsfolk", script: "tb", ability: {
    sv: "Varje natt (utom den första) får du veta rollen på den som avrättades i dag.",
    en: "Each night (except the first), you learn which character died by execution today.",
  }},
  { id: "monk", name: "Monk", team: "townsfolk", script: "tb", ability: {
    sv: "Varje natt (utom den första) väljer du en spelare (inte dig själv) som skyddas från Demonen i natt.",
    en: "Each night (except the first), choose a player (not yourself): they are safe from the Demon tonight.",
  }},
  { id: "ravenkeeper", name: "Ravenkeeper", team: "townsfolk", script: "tb", ability: {
    sv: "Om du dör i natt väcks du och väljer en spelare vars roll du får veta.",
    en: "If you die at night, you are woken to choose a player: you learn their character.",
  }},
  { id: "virgin", name: "Virgin", team: "townsfolk", script: "tb", ability: {
    sv: "Första gången du nomineras: om nominatorn är Townsfolk avrättas de omedelbart.",
    en: "The first time you are nominated, if the nominator is a Townsfolk, they are executed immediately.",
  }},
  { id: "slayer", name: "Slayer", team: "townsfolk", script: "tb", ability: {
    sv: "En gång per spel, på dagen, pekar du ut en spelare offentligt. Om det är Demonen dör de.",
    en: "Once per game, during the day, publicly choose a player: if they are the Demon, they die.",
  }},
  { id: "soldier", name: "Soldier", team: "townsfolk", script: "tb", ability: {
    sv: "Du är skyddad från att dödas av Demonen.",
    en: "You are safe from the Demon.",
  }},
  { id: "mayor", name: "Mayor", team: "townsfolk", script: "tb", ability: {
    sv: "Om bara 3 spelare lever och ingen avrättning sker vinner ditt lag. Du kan slippa dö på natten – någon annan dör istället.",
    en: "If only 3 players live and no execution occurs, your team wins. You might not die at night, another player dies instead.",
  }},
  { id: "butler", name: "Butler", team: "outsider", script: "tb", ability: {
    sv: "Varje natt väljer du en spelare (inte dig själv). Nästa dag får du bara rösta om den spelaren också röstar.",
    en: "Each night, choose a player (not yourself): tomorrow, you may only vote if they vote too.",
  }},
  { id: "drunk", name: "Drunk", team: "outsider", script: "tb", ability: {
    sv: "Du tror att du är en Townsfolk-roll, men din förmåga fungerar inte och du får inga sanningsenliga svar.",
    en: "You do not know you are the Drunk. You think you are a Townsfolk, but your ability malfunctions.",
  }, secondaryRoleSlots: [
    { id: "belief", team: "townsfolk", count: 1, label: { sv: "Tror att den är", en: "Believes they are" } },
  ]},
  { id: "recluse", name: "Recluse", team: "outsider", script: "tb", ability: {
    sv: "Du kan visas som ond, och som Minion eller Demon, även om du är död.",
    en: "You might register as evil and as a Minion or Demon, even if dead.",
  }},
  { id: "saint", name: "Saint", team: "outsider", script: "tb", ability: {
    sv: "Om du avrättas förlorar ditt lag spelet direkt.",
    en: "If you are executed, your team loses.",
  }},
  { id: "poisoner", name: "Poisoner", team: "minion", script: "tb", ability: {
    sv: "Varje natt förgiftar du en spelare – deras förmåga fungerar fel fram till nästa natt.",
    en: "Each night, choose a player: they are poisoned tonight and tomorrow day.",
  }},
  { id: "spy", name: "Spy", team: "minion", script: "tb", ability: {
    sv: "Varje natt ser du hela Grimoire (alla roller och statusar). Du kan visas som god.",
    en: "Each night, you see the Grimoire. You might register as good.",
  }},
  { id: "scarlet-woman", name: "Scarlet Woman", team: "minion", script: "tb", ability: {
    sv: "Om 5 eller fler spelare lever och Demonen dör blir du den nya Demonen.",
    en: "If there are 5 or more players alive and the Demon dies, you become the Demon.",
  }},
  { id: "baron", name: "Baron", team: "minion", script: "tb", ability: {
    sv: "Extra Outsiders läggs till i spelet vid start.",
    en: "There are extra Outsiders in play.",
  }, distributionModifier: { outsider: 2, townsfolk: -2 }},
  { id: "imp", name: "Imp", team: "demon", script: "tb", ability: {
    sv: "Varje natt (utom den första) dödar du en spelare. Dödar du dig själv blir en Minion den nya Imp.",
    en: "Each night (except the first), choose a player: they die. If you kill yourself, a Minion becomes the Imp.",
  }},

  // ---------------------------------------------------------------------
  // Bad Moon Rising
  // ---------------------------------------------------------------------
  { id: "grandmother", name: "Grandmother", team: "townsfolk", script: "bmr", ability: {
    sv: "Du vet natt 1 vilken spelare och roll som är ditt barnbarn. Om Demonen dödar dem dör du också.",
    en: "You start knowing a good player's character. If the Demon kills them, you die too.",
  }},
  { id: "sailor", name: "Sailor", team: "townsfolk", script: "bmr", ability: {
    sv: "Varje natt gör du antingen dig själv eller en annan spelare drunken till skymningen. Du kan inte dö.",
    en: "Each night, choose an alive player: either you or they are drunk until dusk. You can't die.",
  }},
  { id: "chambermaid", name: "Chambermaid", team: "townsfolk", script: "bmr", ability: {
    sv: "Varje natt väljer du två spelare (inte dig själv) och får veta hur många av dem som vaknade av sin egen förmåga i natt.",
    en: "Each night, choose 2 players (not yourself): you learn how many woke tonight due to their own ability.",
  }},
  { id: "exorcist", name: "Exorcist", team: "townsfolk", script: "bmr", ability: {
    sv: "Varje natt (utom den första) väljer du en spelare (inte samma som föregående natt). Om det är Demonen får de veta att du valde dem.",
    en: "Each night (except the first), choose a player (not the same as last night): if you chose the Demon, they learn you did.",
  }},
  { id: "innkeeper", name: "Innkeeper", team: "townsfolk", script: "bmr", ability: {
    sv: "Varje natt (utom den första) väljer du två spelare: de kan inte dö i natt, men en av dem blir drunken till skymningen.",
    en: "Each night (except the first), choose 2 players: they can't die tonight, one is drunk until dusk.",
  }},
  { id: "gambler", name: "Gambler", team: "townsfolk", script: "bmr", ability: {
    sv: "Varje natt (utom den första) väljer du en spelare och gissar deras roll. Gissar du fel dör du.",
    en: "Each night (except the first), choose a player and guess their character: if wrong, you die.",
  }},
  { id: "gossip", name: "Gossip", team: "townsfolk", script: "bmr", ability: {
    sv: "Varje dag kan du göra ett offentligt påstående. Om det stämmer dör en ond spelare i natt.",
    en: "Each day, you may make a public statement. If it's true, an evil player dies at night.",
  }},
  { id: "courtier", name: "Courtier", team: "townsfolk", script: "bmr", ability: {
    sv: "En gång per spel väljer du en roll: den spelaren blir drunken i tre nätter och dagar.",
    en: "Once per game, choose a character: they are drunk for 3 nights and 3 days.",
  }},
  { id: "professor", name: "Professor", team: "townsfolk", script: "bmr", ability: {
    sv: "En gång per spel, på natten, väljer du en död Townsfolk. Om det stämmer väcks de till liv igen.",
    en: "Once per game, at night, choose a dead Townsfolk: if alive, they are resurrected.",
  }},
  { id: "minstrel", name: "Minstrel", team: "townsfolk", script: "bmr", ability: {
    sv: "När en Minion avrättas blir alla andra spelare drunkna fram till nästa skymning.",
    en: "When a Minion dies by execution, all other players are drunk until the next dusk.",
  }},
  { id: "tea-lady", name: "Tea Lady", team: "townsfolk", script: "bmr", ability: {
    sv: "Dina två levande grannar kan inte dö så länge båda är goda.",
    en: "Your 2 alive neighbours can't die if both are good.",
  }},
  { id: "pacifist", name: "Pacifist", team: "townsfolk", script: "bmr", ability: {
    sv: "En avrättad god spelare kan överleva avrättningen.",
    en: "An executed good player might not die.",
  }},
  { id: "fool", name: "Fool", team: "townsfolk", script: "bmr", ability: {
    sv: "Första gången du skulle dö överlever du istället.",
    en: "The first time you would die, you don't.",
  }},
  { id: "tinker", name: "Tinker", team: "outsider", script: "bmr", ability: {
    sv: "Du kan dö när som helst, utan anledning.",
    en: "You might die at any time.",
  }},
  { id: "moonchild", name: "Moonchild", team: "outsider", script: "bmr", ability: {
    sv: "Natt 1 pekar du offentligt ut en spelare. Om du dör och de är god kan berättaren låta dem dö också.",
    en: "You start by publicly choosing a player. If you die and they are good, the Storyteller may kill them too.",
  }},
  { id: "goon", name: "Goon", team: "outsider", script: "bmr", ability: {
    sv: "Den första spelaren som väljer dig varje natt blir drunken. Din lagtillhörighet kan skifta.",
    en: "Each night, the first player to choose you is drunk until dusk. You might change alignment.",
  }},
  { id: "lunatic", name: "Lunatic", team: "outsider", script: "bmr", ability: {
    sv: "Du tror att du är Demonen och agerar som en, men har ingen verklig kraft. Den riktiga Demonen vet vem du är.",
    en: "You think you are a Demon and act like one each night, but have no real power. The Demon knows who you are.",
  }, secondaryRoleSlots: [
    { id: "belief", team: "demon", count: 1, label: { sv: "Tror att den är", en: "Believes they are" } },
    { id: "bluffs", team: "minion", count: 2, label: { sv: "Fejkade minions", en: "Fake minions" } },
  ]},
  { id: "godfather", name: "Godfather", team: "minion", script: "bmr", ability: {
    sv: "Du får veta vilka Outsiders som är med i spelet. Om en Outsider dör väljer du en spelare som dör i natt.",
    en: "You start knowing which Outsiders are in play. If an Outsider dies, choose a player: they die at night.",
  }},
  { id: "devils-advocate", name: "Devil's Advocate", team: "minion", script: "bmr", ability: {
    sv: "Varje natt väljer du en levande spelare: om de avrättas nästa dag överlever de istället.",
    en: "Each night, choose a living player (not the same as last night): if executed tomorrow, they don't die.",
  }},
  { id: "assassin", name: "Assassin", team: "minion", script: "bmr", ability: {
    sv: "En gång per spel, på natten, kan du döda en spelare oavsett skydd.",
    en: "Once per game, at night, choose a player: they die, even if for some reason they could not.",
  }},
  { id: "mastermind", name: "Mastermind", team: "minion", script: "bmr", ability: {
    sv: "Om Demonen dör genom avrättning och det annars skulle avsluta spelet fortsätter spelet en dag till.",
    en: "If the Demon dies by execution, play may proceed for one more day if your team then chooses a new Demon.",
  }},
  { id: "zombuul", name: "Zombuul", team: "demon", script: "bmr", ability: {
    sv: "Om ingen dog föregående dag dödar du en spelare i natt, och du kan inte dö förrän det skett offentligt.",
    en: "Each night, if no one died today, choose a player: they die. You cannot die until this happens publicly.",
  }},
  { id: "pukka", name: "Pukka", team: "demon", script: "bmr", ability: {
    sv: "Varje natt förgiftar du en spelare. Den tidigare förgiftade spelaren dör då, om de fortfarande är förgiftade.",
    en: "Each night, choose a player: they are poisoned. The previously poisoned player dies, then is no longer poisoned.",
  }},
  { id: "shabaloth", name: "Shabaloth", team: "demon", script: "bmr", ability: {
    sv: "Varje natt (utom den första) dödar du upp till två spelare. En kan komma tillbaka till livet natten efter.",
    en: "Each night (except the first), choose two players: they die. A dead one might be brought back to life.",
  }},
  { id: "po", name: "Po", team: "demon", script: "bmr", ability: {
    sv: "Varje natt kan du välja att inte döda – nästa natt dödar du då upp till tre spelare istället för en.",
    en: "Each night, you may choose not to kill; if so, the next night you may kill up to three players.",
  }},

  // ---------------------------------------------------------------------
  // Sects & Violets
  // ---------------------------------------------------------------------
  { id: "clockmaker", name: "Clockmaker", team: "townsfolk", script: "sv", ability: {
    sv: "Du får natt 1 veta hur många steg det är mellan Demonen och den närmaste Minion i sittordningen.",
    en: "You start knowing how many steps between the Demon and its nearest Minion.",
  }},
  { id: "dreamer", name: "Dreamer", team: "townsfolk", script: "sv", ability: {
    sv: "Varje natt väljer du en spelare och får veta en god och en ond roll, varav en är deras faktiska roll.",
    en: "Each night, choose a player (not yourself): you learn one good and one evil character, one of which is correct.",
  }},
  { id: "snake-charmer", name: "Snake Charmer", team: "townsfolk", script: "sv", ability: {
    sv: "Varje natt väljer du en spelare: om det är Demonen byts era roller, och den nya Demonen blir förgiftad.",
    en: "Each night, choose a player: a chosen Demon swaps characters and alignments with you, and becomes poisoned.",
  }},
  { id: "mathematician", name: "Mathematician", team: "townsfolk", script: "sv", ability: {
    sv: "Varje natt får du veta hur många spelares förmågor som påverkats felaktigt av onda krafter i natt.",
    en: "Each night, you learn how many players' abilities worked abnormally due to evil abilities tonight.",
  }},
  { id: "flowergirl", name: "Flowergirl", team: "townsfolk", script: "sv", ability: {
    sv: "Varje natt (utom den första) får du veta om Demonen röstade i dag.",
    en: "Each night (except the first), you learn if the Demon voted today.",
  }},
  { id: "town-crier", name: "Town Crier", team: "townsfolk", script: "sv", ability: {
    sv: "Varje natt (utom den första) får du veta om en Minion nominerade i dag.",
    en: "Each night (except the first), you learn if a Minion nominated today.",
  }},
  { id: "oracle", name: "Oracle", team: "townsfolk", script: "sv", ability: {
    sv: "Varje natt (utom den första) får du veta hur många döda spelare som är onda.",
    en: "Each night (except the first), you learn how many dead players are evil.",
  }},
  { id: "savant", name: "Savant", team: "townsfolk", script: "sv", ability: {
    sv: "Varje dag får du två påståenden av berättaren, ett sant och ett falskt, i valfri ordning.",
    en: "Each day, you may visit the Storyteller to learn two statements, one true and one false, in an order of the Storyteller's choice.",
  }},
  { id: "seamstress", name: "Seamstress", team: "townsfolk", script: "sv", ability: {
    sv: "En gång per spel, på natten, väljer du två spelare och får veta om de är i samma lag.",
    en: "Once per game, at night, choose 2 players (not yourself): you learn if they are the same alignment.",
  }},
  { id: "philosopher", name: "Philosopher", team: "townsfolk", script: "sv", ability: {
    sv: "En gång per spel, på natten, tar du en annan Townsfolk-förmåga. Din tidigare förmåga slutar fungera.",
    en: "Once per game, at night, choose a good character: you gain that ability. Your previous ability stops working.",
  }},
  { id: "artist", name: "Artist", team: "townsfolk", script: "sv", ability: {
    sv: "En gång per spel, på dagen, ställer du en ja/nej-fråga till berättaren om spelet och får ett sant svar.",
    en: "Once per game, during the day, privately ask the Storyteller any yes/no question and get a truthful answer.",
  }},
  { id: "juggler", name: "Juggler", team: "townsfolk", script: "sv", ability: {
    sv: "Dag 1 kan du offentligt gissa upp till fem spelares roller. Natten efter får du veta hur många du gissade rätt.",
    en: "On your first day, publicly guess up to 5 players' characters. That night, you learn how many you got correct.",
  }},
  { id: "sage", name: "Sage", team: "townsfolk", script: "sv", ability: {
    sv: "Om Demonen dödar dig får du veta att en av två spelare är Demonen.",
    en: "If the Demon kills you, you learn that it is one of two players.",
  }},
  { id: "mutant", name: "Mutant", team: "outsider", script: "sv", ability: {
    sv: "Om du visar tecken på att vara ond (t.ex. avslöjar dig som Outsider) kan du avrättas direkt.",
    en: "If you publicly claim to be an Outsider, you might be executed that day, immediately.",
  }},
  { id: "sweetheart", name: "Sweetheart", team: "outsider", script: "sv", ability: {
    sv: "När du dör blir en slumpmässig levande spelare förgiftad permanent.",
    en: "When you die, a player is drunk from now on.",
  }},
  { id: "barber", name: "Barber", team: "outsider", script: "sv", ability: {
    sv: "Om du dör kan Demonen samma natt byta roller mellan två spelare.",
    en: "If you die, that night the Demon may swap the characters of two players.",
  }},
  { id: "klutz", name: "Klutz", team: "outsider", script: "sv", ability: {
    sv: "När du dör måste du offentligt peka ut en spelare. Om de är onda dör de också.",
    en: "When you learn that you died, publicly choose a player: if they are evil, they die too.",
  }},
  { id: "evil-twin", name: "Evil Twin", team: "minion", script: "sv", ability: {
    sv: "Du och en god spelare (din tvilling) vet om varandra. Bara ett av lagen kan vinna.",
    en: "You and an opposing player know each other. If either is executed, good loses.",
  }},
  { id: "witch", name: "Witch", team: "minion", script: "sv", ability: {
    sv: "Varje natt förbannar du en spelare: röstar de nästa dag dör de omedelbart.",
    en: "Each night, choose a player: if they vote today, they die. If just 3 players live, you lose this ability.",
  }},
  { id: "cerenovus", name: "Cerenovus", team: "minion", script: "sv", ability: {
    sv: "Varje natt ger du en spelare en påtvingad galenskap. Avrättas de inte för den kan de dö istället.",
    en: "Each night, choose a player and a good character: they think they are that character, madly. If not executed for it, they might die.",
  }},
  { id: "pit-hag", name: "Pit-Hag", team: "minion", script: "sv", ability: {
    sv: "Varje natt kan du välja en spelare och en roll: de blir den rollen (med vissa begränsningar).",
    en: "Each night (except the first), choose a player and a character: they become that character, with some restrictions.",
  }},
  { id: "fang-gu", name: "Fang Gu", team: "demon", script: "sv", ability: {
    sv: "Varje natt dödar du en spelare. De första gångerna du dödar en Outsider blir de istället den nya Fang Gu.",
    en: "Each night, choose a player: they die. The first time you kill an Outsider, they become the new Fang Gu instead.",
  }},
  { id: "vigormortis", name: "Vigormortis", team: "demon", script: "sv", ability: {
    sv: "Varje natt dödar du en spelare, och en av deras grannar blir förgiftad. Döda Minions behåller sin förmåga.",
    en: "Each night, choose a player: they die, their neighbours are poisoned. Dead Minions you kill retain their ability.",
  }},
  { id: "no-dashii", name: "No Dashii", team: "demon", script: "sv", ability: {
    sv: "Varje natt dödar du en spelare. En levande Townsfolk-granne är permanent förgiftad.",
    en: "Each night, choose a player: they die. A nearby Townsfolk is poisoned.",
  }},
  { id: "vortox", name: "Vortox", team: "demon", script: "sv", ability: {
    sv: "Varje natt dödar du en spelare. Sanningsenliga förmågor ger falska svar och falska påståenden ger inga döda.",
    en: "Each night, choose a player: they die. Good abilities yield false information; if no execution occurs, evil wins.",
  }},
];

export function rolesForScript(script: BuiltinScriptId): Role[] {
  return ROLES.filter((r) => r.script === script);
}

export function roleById(id: string | null): Role | undefined {
  if (!id) return undefined;
  return ROLES.find((r) => r.id === id);
}

// Custom scenarios preserve an official role's id when it's added from the
// catalog, so this lookup works for both builtin games and custom ones —
// purely user-invented roles simply won't match anything here.
export function distributionModifierFor(roleId: string) {
  return roleById(roleId)?.distributionModifier;
}

export function secondaryRoleSlotsFor(roleId: string | null) {
  return roleById(roleId)?.secondaryRoleSlots ?? [];
}

export const TEAM_ORDER: Role["team"][] = ["townsfolk", "outsider", "minion", "demon"];
