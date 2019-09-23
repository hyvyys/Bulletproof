import GraphemeSplitter from "grapheme-splitter";

export default {
  lower(str) {
    let splitter = new GraphemeSplitter();
    let graphemes = splitter.splitGraphemes(str);
    return graphemes.filter(g => g.toLowerCase() === g).join("");
  },
  upper(str) {
    let splitter = new GraphemeSplitter();
    let graphemes = splitter.splitGraphemes(str);
    return graphemes.filter(g => g.toUpperCase() === g).join("");
  },
}
