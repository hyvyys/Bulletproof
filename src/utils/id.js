export default function(proposal) {
  if (!proposal) {
    let id = '';
    do {
      let val = Math.random() * (2 ** 8);
      let hex = val.toString(16);
      id = 'b' + hex;
    } while (document.getElementById(id));
    return id;
  }
  else {
    let id = proposal;
    let i = 1;
    while (document.getElementById(id)) {
      id = `${proposal}-${i++}`;
    }
    return id;
  }
}
