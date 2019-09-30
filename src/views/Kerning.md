Kerning strings can be generated in the [Kerning tab](/kerning). Each string is defined using a **pattern** consisting of character sets called **segments**.

**Regular segments** are sets of letters, characters, or words that will be interpolated to create the kerning string. There are two kinds of regular segments:

  * Single-character segments, e.g. `A-Za-ząćę`.
  * Multi-character segments, e.g. `|fi|fj|fl|`.
  
**Closure segments** start with an at `@` and are used to surround the interpolated substrings with extra characters, typically punctuation. These also come in two flavors:

  * Single character closures, e.g. `@()[]{}`. Characters after `@` are treated as opening–closing pairs.
  * Multiple character closures, e.g. `@|“_”.|“_.”|“_”,|“_,”|`. Anything before the underscore `_` is treated as prefix, everything after — as suffix. Either can be empty, e.g. `@|_,|` is a suffix-only closure.

Multiple closure segments can be combined. A pattern of the following segments:
> `abc`
  `@“”‘’`
  `@()`

will yield `(“a”) (‘a’) (“b”) (‘b’) (“c”) (‘c’)`.
   
## Summary 

The segment syntax has just five special characters:

  * at `@` (only at the beginning of segment) — begins a closure segment,
  * hyphen `-` — signifies character range,
  * pipe `|` — delimits words or closures,
  * underscore `_`, — separates closure prefix and suffix,
  * and backslash `\` — escapes the above (and itself), e.g. `@|\|_\|\_|` means a closure segment with a `|` prefix and `|_` suffix.