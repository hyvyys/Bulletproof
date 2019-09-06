export default function (id) {
  return id
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
