# State machine maker

Editor drag and drop per disegnare macchine a stati. Zero dipendenze a runtime:
TypeScript + SVG, compilato con Vite (~11 KB di JS).

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + build in dist/
```

## Come si usa

| Gesto | Effetto |
| --- | --- |
| Doppio clic sul foglio | nuovo stato, ti chiede subito il nome |
| Trascina uno stato | lo sposta (aggancio a 10 px) |
| Trascina il pallino blu su un altro stato | nuova transizione, ti chiede l'evento |
| Pallino blu sullo stesso stato | transizione su se stesso |
| Doppio clic su stato / freccia | rinomina stato / modifica eventi (separati da virgola) |
| `Canc` · `I` · `F` · `Esc` | elimina · iniziale · finale · deseleziona |

La bozza si salva da sola nel browser (localStorage). *Salva* la manda al
server ([stateMachineMakerSERVER](https://github.com/Sorbolik/stateMachineMakerSERVER)),
*Apri…* elenca quelle salvate. *Esporta* e *Importa* scaricano e caricano lo stesso JSON.

## Server e pubblicazione

Su Cloudflare l'editor e l'API hanno lo stesso indirizzo
(`state-machine-maker.sergiosorbi.workers.dev`): `dist/` viene servito come sito
statico e solo `/api/*` passa da `worker/index.ts`, che gira la richiesta al Worker
`state-machine-api` con un service binding. L'API non ha un indirizzo pubblico suo,
quindi una sola regola Cloudflare Access protegge tutto.

- Postman: `https://state-machine-maker.sergiosorbi.workers.dev/api/machines` con gli
  header di un service token Access (`CF-Access-Client-Id`, `CF-Access-Client-Secret`).
- In sviluppo `VITE_API_URL` (`.env.development`) punta a `http://localhost:8787`:
  avvia il server con `npm run dev` nel suo repo.
- Build: `npm run build`, deploy: `npx wrangler deploy`.

Ogni push su `main` viene pubblicato da Cloudflare Workers Builds. Se cambi sia
l'editor sia il server, pubblica prima l'editor: il server non ha un indirizzo
pubblico e si raggiunge solo da `/api` dell'editor.
