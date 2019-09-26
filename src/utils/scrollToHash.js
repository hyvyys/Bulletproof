export default function scrollToHash(a, scrolled, hash = null) {
  if (hash == null) {
    hash = a.getAttribute("href");
  }

  const escaped = hash.slice(1).replace(/\\/g, "\\\\");
  const selector = `[id='${ escaped }']`;
  const target = document.querySelector(selector);

  if (target) {
    const top = target.offsetTop;
    scrolled.scrollTop = top;
  }
}
