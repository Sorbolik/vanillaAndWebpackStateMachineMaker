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

Chiunque ha tutte le funzioni, *Salva* e *Apri…* compresi, ma senza chiave le
macchine restano solo nella pagina: ricaricando si perdono e si riparte dall'esempio.

Il database è solo del proprietario. *Accedi* chiede la chiave (`ADMIN_KEY` del
server); con la chiave giusta *Salva* e *Apri…* usano il database
([stateMachineMakerSERVER](https://github.com/Sorbolik/stateMachineMakerSERVER))
e la bozza resta nel browser. *Esci* cancella chiave e bozza da quel browser.

Dentro un iframe (il portfolio) o con `?embed` nell'indirizzo *Accedi* non c'è.

## Server e pubblicazione

Su Cloudflare l'editor e l'API hanno lo stesso indirizzo
(`state-machine-maker.sergiosorbi.workers.dev`): `dist/` viene servito come sito
statico e solo `/api/*` passa da `worker/index.ts`, che gira la richiesta al Worker
`state-machine-api` con un service binding. L'API non ha un indirizzo pubblico suo.

- Postman: `https://state-machine-maker.sergiosorbi.workers.dev/api/machines` con
  l'header `Authorization: Bearer <chiave>`.
- In sviluppo `VITE_API_URL` (`.env.development`) punta a `http://localhost:8787`:
  avvia il server con `npm run dev` nel suo repo.
- Build: `npm run build`, deploy: `npx wrangler deploy`.

Ogni push su `main` viene pubblicato da Cloudflare Workers Builds. Se cambi sia
l'editor sia il server, pubblica prima l'editor: il server non ha un indirizzo
pubblico e si raggiunge solo da `/api` dell'editor.
