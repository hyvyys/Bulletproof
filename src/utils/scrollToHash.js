export default function scrollToHash(a, scrolled, hash = null) {
  if (hash == null) {
    hash = a.getAttribute("href");
  }

  const escaped = hash.slice(1).replace(/\\/g, "\\\\");
  const selector = `[id='${ escaped }']`;
  const target = document.querySelector(selector);

  if (target) {
    let top = target.offsetTop;
    // let parent = target.parentElement;
    // while (parent != scrolled) {
    //   top += parent.offsetTop;
    //   console.log(parent, parent.offsetTop)
    //   parent = parent.parentElement;
    // }
    scrolled.scrollTop = top;
  }
}
