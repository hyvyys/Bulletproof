export default function(a, scrolled) {
  const href = a.getAttribute("href").slice(1);
  const escaped = href.replace(/\\/g, "\\\\");
  const selector = `[id='${ escaped }']`;
  const target = document.querySelector(selector);
  if (target) {
    const top = target.offsetTop;
    scrolled.scrollTop = top;
  }
}
