import GraphemeSplitter from "grapheme-splitter";

/* why did I need this class again?? I have my chars separated by spaces after all.  */

export default {
  filter(str, predicate) {
    let splitter = new GraphemeSplitter();
    let graphemes = splitter.splitGraphemes(str);
    return graphemes.filter(predicate).join("");
  },
}
