import characterRange from "@/utils/characterRange";
import cartesianProduct from "@/utils/cartesianProduct";

export default class KerningGenerator {
  static sets(segments) {
    const sets = [];
    let closures = [];

    segments.forEach(s => {
      if (/^@(?!@)/.test(s)) {
        s = s.replace(/^@/, "");
        closures = Array.from(s.matchAll(/(.)(.)/g)).map(m => [m[1], m[2]]);
      }

      // words etc.
      else if (/^\(.+\)$/.test(s)) {
        let fragments = [];
        s = s.replace(/^\(/, "").replace(/\)$/, ""); // trim group delimiters ( )

        let options = [];
        let current = "";
        s.split("").forEach(char => {
          if (char === "|" && !/\\$/.test(current)) {
            options.push(current);
            current = "";
          }
          else { // pipe was escaped as \|
            current += char;
          }
        });
        options.push(current);

        options = options.map(o => o.replace(/\\\|/, "|"));
        [].push.apply(fragments, options);
        sets.push(fragments);
      }

      // character sets incl. ranges, only hyphen is escaped as \-
      // else if (/^\[.+\]$/.test(s)) {
      else {
        if (/^\[.+\]$/.test(s)) {
          s = s.replace(/^\[/, "").replace(/]$/, ""); // trim range delimiters [ ]
        }

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

      // else {
      //   sets.push([s]);
      // }
    });
    return { sets, closures };
  }

  static kerningString(pattern) {
    const sets = JSON.parse(JSON.stringify(pattern.sets));
    let product = cartesianProduct(...sets);
    //            [ ['A', 'A'], ['A', 'B'], ['A', 'C'], ... ]

    let lines = [];
    let current = product[0][0];
    let line = "";

    function commitLine(line) {
      if (!pattern.closures.length) {
        //    AAABACAD...WAXAYAZ
        // => AAABACAD...WAXAYAZA
        line += current;
      }
      line = line.replace(/(.)\1{2,}/g, "$1$1"); // AAABACA => AABACA
      lines.push(line);
    }

    product.forEach(sub => {
      // new character on first position, finalize line
      if (sub[0] !== current) {
        commitLine(line);
        line = "";
        current = sub[0];
      }

      let fragment = sub.join("");
      if (pattern.closures.length) {
        fragment = pattern.closures
          .map(closure => `${closure[0]}${fragment}${closure[1]}`)
          .join(" ") + " ";
      }
      line += fragment;
    });
    commitLine(line);

    return lines;
  }
}
