Parameters in the URL query string can be used to load custom fonts hosted elsewhere online and then share the result with others. For example, <a href="/glyphs?preload=/fonts/Rywalka-Regular.ttf" target="_blank">here’s the glyphs tab with Rywalka loaded</a> (opens in a new tab).

To do this, add a `preload` query parameter with the URL of your font file, for example `?preload=https://example.com/Font.ttf`, to the end of the page URL.

You can even add multiple files by separating each parameter with `&`, for example `?preload=URL1&preload=URL2&preload=URL3`.

When preloading mutliple font URLs, you can set an additional `f` parameter with the name of the font to display by default. The other fonts will be available from the drop-down fonts menu. Here’s a full example:

```
https://bulletproof.italic.space/ABCs?preload=https://bulletproof.italic.space/fonts/Rywalka-
Regular.ttf&preload=https://bulletproof.italic.space/fonts/Graduate.ttf&f=Rywalka
```

This will open the ABCs tab, preload Rywalka and Graduate to the fonts menu, and set Rywalka as the initially displayed font.

---

### Notes

- Your font must be served over HTTPS, otherwise it will fail to load.
- Currently Bulletproof supports loading TTF, OTF, and WOFF font files, but not WOFF2.