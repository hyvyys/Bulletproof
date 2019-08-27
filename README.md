# [Bulletproof](https://hyvyys.github.io/Bulletproof/)

A visual font testing tool, largely inspired by Pablo Impallari's font testing site.

# Features

  * Loading local font files
  * Setting texts in various languages including pangrams, sentences, ABC's (and AĄBCĆ's), etc. (drawn from my other project [language-data](https://github.com/hyvyys/language-data)). Those text strings can be filtered by language script (Latin, Cyrillic, Greek... more to come, maybe), region, number of speakers, or specific languages can be chosen.
  * Setting font size and line height, text alignment, text and background colors
  * Toggling OpenType features on and off
  * Manipulating OpenType Variation axes
  * Animating OpenType Variation axes via CSS keyframes
  * Feature and variation axes detection based on font file (thanks to [OpenType.js](https://github.com/opentypejs/opentype.js))

# Roadmap

  * Kerning string generator
  * “Waterfall” of samples of degrading point sizes
  * Grouped and named feature toggles
  * A more user-friendly GUI for animations, automating some bits
  * Animation of colors, text, etc. — would be useful for recording gifs or videos
  * Enable storing a list of font files to open. This would require downloading the built app and running it with a user-defined list of local font files (via text file). Opening local files automatically from live site is impossible for security reasons. They would need to be uploaded (you wouldn't like that!) and I would need to run a server.
