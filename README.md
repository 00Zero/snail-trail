# Snail Trail Cursive

A cursive handwriting app for kids that runs in the browser. Trace joined lowercase letters, cursive capitals, numbers, and words (including names) with a finger or Apple Pencil. A snail follows along, and kids earn stars and stickers.

**Live site:** https://00zero.github.io/snail-trail/

## Using it on an iPad
1. Open the live site in Safari.
2. Tap Share → **Add to Home Screen**. It opens full screen like an app.
3. Progress, stickers, and settings are saved in that iPad's browser only.

Grown-up settings: on the home screen, press and hold **Grown-ups**. From there you can set the trail width, choose what happens when a child goes off the trail, manage writers and word lists, and view a progress report.

## What's inside
Everything is in `index.html`: plain HTML, CSS, and JavaScript, with no framework and no build step.

- **Letter models:** each letter is hand-written curve data in units where the x-height is 100 (baseline 0, midline -100, top line -200). Letters join through generated lead-in strokes. b, o, v, and w exit at the midline. Capitals (`U`) list their strokes in order; those marked `j` join the next letter.
- **Tracing engine:** a canvas with Pointer Events. Each stroke is sampled into evenly spaced points. Progress only moves forward to the first close match a short distance ahead, so children can't skip retraced parts (like the stem of an "a") or cut across a letter.
- **Modes:** Practice (1–3 stars) and Trail Climb (five rounds with less help each round).
- **Sound and voice:** sounds are generated with Web Audio; letters and words are spoken with the browser's text-to-speech.

## Checking changes to letter shapes
```bash
node tests/check-letters.js index.html tests/sheet.svg
```
This draws every letter, number, and sample word to `tests/sheet.svg` (open it in a browser). It also simulates a child tracing each one at every trail width and reports any that don't finish. The "shortcut" numbers should stay well below 1.

## Ideas for later
- Parent logins and progress synced across devices (Supabase)
