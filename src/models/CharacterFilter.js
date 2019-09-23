import GraphemeSplitter from "grapheme-splitter";

export default {
  filter(str, predicate) {
    let splitter = new GraphemeSplitter();
    let graphemes = splitter.splitGraphemes(str);
    return graphemes.filter(predicate).join("");
  },
}
