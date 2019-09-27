export default function kerningPatternName(pattern) {
  // let id = pattern.segments
  //   .filter(s => s.length)
  //   .map(s => s
  //     .replace(/ /g, "_")
  //   )
  //   .join(" × ");
  // return id;
  return pattern.lines[0];
}
