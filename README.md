# Blood on the Clocktower – Companion

En liten spelhjälp för Blood on the Clocktower. Rent frontend, ingen backend – allt sparas i webbläsarens `localStorage`.

## Funktioner

- Starta ett nytt spel (Trouble Brewing, Bad Moon Rising eller Sects & Violets) och lägg till spelare
- Spelet sparas automatiskt i `localStorage` och överlever en sidladdning
- Tilldela roller till spelare
- Visualisering av spelarna sittandes i en cirkel
- Markera spelare som döda eller fulla direkt i cirkeln
- Reminder-tokens (fritext) per spelare
- Svenska/engelska, växlingsbart i headern

## Utveckling

```bash
npm install
npm run dev
```

## Bygga

```bash
npm run build
```

## Deploy till GitHub Pages

Workflowen `.github/workflows/deploy.yml` bygger och publicerar `main`-branchen automatiskt via GitHub Actions.

Engångsinställning i repot: **Settings → Pages → Source: GitHub Actions**.
