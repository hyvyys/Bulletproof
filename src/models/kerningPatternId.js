import getId from "@/utils/id";

export default function (segments) {
  let id = segments
    .map(s => s
      .replace(/ /g, "_")
    )
    .join("×");
  return getId(id);
}
