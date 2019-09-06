<template>
  <div class="help reading">
    <h2 id="kerning">Kerning tab</h2>
    <p>To generate a new kerning string, add a new pattern by specifying at least two segments. Each segment is either a set of characters (including continuous ranges) or a set of words (strings longer than one character). Use the latter for instance to test how your ligatures are kerned.</p>
    <p>The syntax is similar to regular expressions, but limited to just two kinds of input:</p>
    <ul>
      <li>
        enclosed in brackets e.g.
        <code>[a-z]</code>,
        <code>[zźż]</code>,
        <code>[a-ząćęłńóśźż]</code>,
        signifies character sets with ranges denoted by hyphen.
      </li>
      <li>
        enclosed in parentheses e.g.
        <code>(fi|fj)</code>,
        signifies arbitrary strings.
      </li>
    </ul>On the unusual occasion that you need to escape the hyphen or pipe, use a backslash,
    e.g.&nbsp;<code>[a-z\-0-9]</code>,
    <code>(PIPE|P\|PE)</code>
  </div>
</template>

<style lang="scss" scoped>
@import "keen-ui/src/styles/imports";

code {
  white-space: nowrap;
  background: mix($brand-primary-color, white, 30%);
  padding: 4px 6px;
  border-radius: 4px;
}
</style>
