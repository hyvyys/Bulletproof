## What’s this all about?

Test your local or remote fonts with the proofing tool developed by a type designer, for type designers. Check out kerning, OpenType features, and language coverage. Explore and animate variation axes in variable fonts.

To begin, load font files via drag’n’drop or by pasting a URL. The fonts’ OpenType features and variation axes will be automatically detected. Everything is processed locally in the browser, using [OpenType.js](https://github.com/opentypejs/opentype.js).

Or if you don't have any font files handy, look around and test the included fonts: [Alegreya Sans](https://github.com/huertatipografica/Alegreya-Sans) by Juan Pablo del Peral, [Graduate](https://github.com/etunni/Graduate-Variable-Font) Variable Font by Eduardo Tunni, and my own Rywalka (work-in-progress).

## Available formatting options
  
  * Changing font size, line height, text alignment, text case transform, text and background colors.
  * Toggling OpenType features on and off.
  * Choosing localization language from the list of languages built into the font.
  * Manipulating OpenType Variation axes.

## Text collection

The multilingual texts and language metadata powering this project are maintained in their own repository and npm package [language-data](https://github.com/hyvyys/language-data). Several kinds of texts are included:

  * ordinary sentences,
  * pangrams,
  * lettering samples — defined as sets of A-Z words preferably repeating the&nbsp;initial letter within),
  * _gotchas_ — edge cases characteristic to the given language, things to look out for when desigining a typeface.

The selection of languages and texts is arbitrary and limited, but contributions are welcome. Currently the focus is on languages written with Latin and Cyrillic.

## Kerning tester

The <router-link to="/kerning">Kerning tab</router-link> has a kerning string generator. A couple of kerning patterns are predefined and more can be created on the fly. <router-link to="/help/kerning">See kerning generator help.</router-link>

## Playground & Animation

Any open text sample can be edited. In the <router-link to="/editor">editor tab</router-link> some more options are available: setting bold and italic (with separately selectable fonts), as well as taking snapshots of the settings and using them as animation keyframes — can be useful for recording gifs or videos, or toggling multiple features on and off more quickly. <router-link to="/help/animation">See animation editor help.</router-link>

## Preload a remote font

If you want to share a link to a specific tab and automatically load a remote font, you can add a query parameter with the URL of your font file — like `?preload=https://example.com/Font.ttf` — to the end of the page URL. <router-link to="/help/query-string">See preloading custom fonts help.</router-link>
