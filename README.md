# Mandarin Flashcards

A small, no-build flashcard app for the travel phrases in `phrases.json`.

## Running it

Open `index.html` in a browser. There is no build step and no server needed.

## How a round works

1. Pick your name (used by the "I'm called {name}" card) and which categories to
   drill, then hit **Start**.
2. The English phrase shows first — try to recall the Chinese.
3. **Show answer** flips the card to the characters, pinyin and the phonetic
   (English-approximation) spelling.
4. Mark yourself **right** or **wrong**. Anything marked wrong comes back at the
   end of the round, and keeps coming back until you get it right.

The deck is reshuffled every round, and again for each repeat pass.

Keyboard: `space`/`enter` flips, `1` = wrong, `2` = right.

## Editing the phrases

`phrases.json` is the source of truth. `phrases.js` is generated from it so the
page works when opened directly from the filesystem (a `fetch()` of a local JSON
file is blocked under `file://`). After editing the JSON, run:

```
node tools/build-phrases.mjs
```
