import characterRange from "@/utils/characterRange";
import cartesianProduct from "@/utils/cartesianProduct";

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function splitWithEscape(s, separator, escape = "\\") {

  const endsWithEscape = new RegExp(escapeRegExp(escape) + "$");
  let fragments = [];
  let options = [];
  let current = "";

  s.split("").forEach(char => {
    if (char === separator && !endsWithEscape.test(current)) {
      options.push(current);
      current = "";
    }
    else { // separator was escaped e.g. \|
      current += char;
    }
  });
  options.push(current);

  const escapedSeparator = new RegExp(escapeRegExp(escape) + escapeRegExp(separator), "g");
  options = options.map(o => o.replace(escapedSeparator, separator));
  [].push.apply(fragments, options);
  return fragments;
}

export default class KerningGenerator {
  /**
   * Split string of alternatives terminated and separated by pipe character.
   * @param {String} s String to parse, e.g. `|fi|fj|fl|ff|`. Pipe escaped with leading backslash, e.g. `|\|:|\:|/:|`.
   */
  static parseSequences(s) {
    s = s.replace(/^\|/, "").replace(/\|$/, ""); // trim group delimiters | ... |
    let fragments = splitWithEscape(s, "|");

    return fragments;
  }

  /**
   * Split closure on the underscore character _, unless escaped \_.
   * @param {String} s String to parse, e.g. `"_",`. Pipe escaped with leading backslash, e.g. |\|:|\:|/:|.
   */
  static parseClosure(s) {
    let fragments = splitWithEscape(s, "_");
    return fragments;
  }

  static sets(segments) {
    const sets = [];
    let closures = [];

    segments.forEach(s => {
      if (/^@/.test(s)) {
        s = s.replace(/^@/, "");
        s = s.replace(/\\@/g, "@");

        let segmentClosures = [];
        const special = "_|\\";
        const escaped = special.split("").map(c => escapeRegExp("\\" + c)).join("|");
        const closureSide = `([^${escapeRegExp(special)}]*|${escaped})*`;
        const compoundClosure = new RegExp(`^\\|(${closureSide}_${closureSide}\\|)+$`);

        if (compoundClosure.test(s)) {
          segmentClosures = this.parseSequences(s).map(c => this.parseClosure(c));
        }
        else {
          segmentClosures = Array.from(s.matchAll(/(.)(.)/g)).map(m => [m[1], m[2]])
        }

        closures.push(segmentClosures);
      }

      // words etc.
      else {
        s = s.replace(/\\@/g, "@");

        if (/^\|.+\|$/.test(s)) {
          sets.push(this.parseSequences(s));
        }

        // character sets incl. ranges, only hyphen is escaped as \-
        else {
          let fragments = [];

          const ranges = s.matchAll(/([^\\])-(.)/g); // e.g. a-z
          Array.from(ranges).forEach(r => {
            let [, start, end] = r;
            [].push.apply(fragments, characterRange(start, end));
          });

          s = s.replace(/([^\\])-(.)/g, "");

          const singleCharacters = s.replace(/\\-/g, "-").split("");
          [].push.apply(fragments, singleCharacters);
          sets.push(fragments);
        }
      }
    });
    return { sets, closures };
  }

  static kerningString(pattern) {
    let sets = pattern.sets.filter(s => s.length);
    // clone
    sets = JSON.parse(JSON.stringify(sets));

    let product = cartesianProduct(...sets);
    //            [ ['A', 'A'], ['A', 'B'], ['A', 'C'], ... ]

    let lines = [];
    let current = product[0][0] || "";
    let line = "";

    function commitLine(line) {
      // add initial character to the end of the line
      if (!pattern.closures.length) {
        //    AAABACAD...WAXAYAZ
        // => AAABACAD...WAXAYAZA
        line += current;
      }
      // remove more than two repetitions of any character
      if (!pattern.closures.length) {
        line = line.replace(/(.)\1{2,}/g, "$1$1"); // AAABACA => AABACA
      }
      lines.push(line);
    }

    product.filter(sub => sub.length).forEach(sub => {
      // new character on first position, finalize line
      if (sub[0] !== current) {
        commitLine(line);
        line = "";
        current = sub[0];
      }

      let fragment = sub.join("");
      if (pattern.closures.length) {
        /*  [
              [ ["(", ")"],  ["[", "]"],  ... ],
              [ [";", "."],  [":", ","],  ... ],
              ... ] */

        const openings = pattern.closures.map(set => set.map(closure => closure[0]));
        const closings = pattern.closures.map(set => set.map(closure => closure[1]));
        /*  [ [ "(", "[", ... ], [ ";", ":", ... ], ...  ] */

        const openingSequences = cartesianProduct(...openings).map(sub => sub.reverse().join(""));
        const closingSequences = cartesianProduct(...closings).map(sub => sub.join(""));
        /* [ ";(", ";[", ":(", ":[", ... ] */

        const closures = openingSequences.map((o, i) => [o, closingSequences[i]]);

        fragment = closures
          .map(closure => `${closure[0]}${fragment}${closure[1]}`)
          .join(" ") + " ";
      }
      line += fragment;
    });
    commitLine(line);

    return lines;
  }
}
