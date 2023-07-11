# Bulletproof

[Bulletproof](https://hyvyys.github.io/Bulletproof/) Font Tester is a font proofing app that loads user-selected local font files and detects their OpenType features and variation axes. Everything is processed locally in the browser, using [OpenType.js](https://github.com/opentypejs/opentype.js).

Available formatting options:
  
  * Changing font size, line height, text alignment, text case transform, text and background colors.
  * Toggling OpenType features on and off.
  * Choosing localization language from the list of languages built into the font.
  * Manipulating OpenType Variation axes.

## Text collection

A set of multilingual texts is collected in a separate project [Language-Data](https://github.com/hyvyys/language-data). It&nbsp;includes a few kinds of texts:

  * ordinary sentences,
  * pangrams,
  * lettering samples — defined as sets of A-Z words preferably repeating the&nbsp;initial letter within),
  * _gotchas_ — edge cases characteristic to the given language, things to look out for when desigining a typeface.

The selection of languages and texts is arbitrary and limited, but contributions are welcome. Currently the focus is on languages written with Latin and Cyrillic.

## Kerning tester

The app is equipped with a <router-link to="/kerning">kerning string generator</router-link>, along with a couple of predefined kerning patterns. [See kerning generator help](https://hyvyys.github.io/Bulletproof/help/kerning).

## Playground & Animation

Any open text sample can be edited. In the <router-link to="/editor">editor tab</router-link> some more options are available: setting bold and italic (with separately selectable fonts), as well as taking snapshots of the settings and using them as animation keyframes — can be useful for recording gifs or videos, or toggling multiple features on and off more quickly. [See animation editor help](https://hyvyys.github.io/Bulletproof/help/animation).

# Development

Last tested in Node.JS v12.22.12.