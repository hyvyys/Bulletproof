export default function kerningPatternName(segments) {
  let id = segments
    .filter(s => s.length)
    .map(s => s
      .replace(/ /g, "_")
    )
    .join(" × ");
  return id;
}
