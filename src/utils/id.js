export default function() {
  let id = '';
  do {
    let val = Math.random() * (2 ** 8);
    let hex = val.toString(16);
    id = 'b' + hex;
  } while (document.getElementById(id));
  return id;
}
