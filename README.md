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

La macchina si salva da sola nel browser (localStorage). *Esporta* e *Importa*
scaricano e caricano lo stesso JSON.

## Formato dati

Una macchina è un solo oggetto JSON, quello che vedi nel pannello a destra:

```json
{
  "v": 1,
  "name": "semaforo",
  "initial": "rosso",
  "final": ["spento"],
  "states": {
    "rosso":  { "x": 160, "y": 160 },
    "verde":  { "x": 400, "y": 160 },
    "giallo": { "x": 280, "y": 330 },
    "spento": { "x": 580, "y": 330 }
  },
  "transitions": [
    { "from": "rosso",  "on": "timer",  "to": "verde" },
    { "from": "verde",  "on": "timer",  "to": "giallo" },
    { "from": "giallo", "on": "timer",  "to": "rosso" },
    { "from": "giallo", "on": "guasto", "to": "spento" }
  ]
}
```

- **Gli stati sono identificati dal nome**: niente UUID, il JSON si legge come la
  macchina stessa. Il nome è unico per costruzione (è la chiave).
- **Una transizione è una frase**: *da* `rosso` *su* `timer` *a* `verde`.
- `x`/`y` sono solo il disegno: chi usa la macchina può ignorarli.
- `v` è la versione del formato, per poterlo cambiare senza rompere i file vecchi.
- Più eventi tra gli stessi due stati sono più transizioni; l'editor li mostra
  su una sola freccia.

## Struttura

```
src/machine.ts   tipi + operazioni pure sul modello (aggiungi, rinomina, valida l'import)
src/editor.ts    disegno SVG e gesti col puntatore
src/main.ts      barra, tastiera, salvataggio, import/export
src/style.css
```

L'SVG viene ridisegnato da zero dal modello a ogni modifica: le macchine sono
piccole, quindi è veloce e lo schermo non può andare fuori sincrono con i dati.
