<h2 id="kerning">Kerning string generator</h2>

To generate a new kerning string, go to the [Kerning tab](/kerning), open the right side contextual panel, and add a new pattern by specifying at least two segments. Each segment is either a set of characters (including continuous ranges) or a set of words (strings longer than one character). Use the latter for instance to test how your ligatures are kerned.

The syntax is similar to regular expressions, but limited to just two kinds of input:

  * enclosed in brackets e.g.
    <code>[a-z]</code>,
    <code>[zźż]</code>,
    <code>[a-ząćęłńóśźż]</code>,
    signifies character sets with ranges denoted by hyphen.
  
  * enclosed in parentheses e.g.
    <code>(fi|fj)</code>,
    signifies arbitrary strings.

On the unusual occasion that you need to escape the hyphen or pipe, use a backslash,  
e.g.&nbsp;<code>[a-z\-0-9]</code>, <code>(PIPE|P\|PE)</code>

<h2 id="animation">Animation editor</h2>