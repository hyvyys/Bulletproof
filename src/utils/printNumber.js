export default function fNum(n) { return n > 1000000 ? n/1000000 + 'M' : n > 9999 ? n/1000 + 'K' : n; };
