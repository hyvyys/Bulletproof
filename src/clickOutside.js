function hideOnClickOutside(element) {
  const outsideClickListener = event => {
      if (!element.contains(event.target) && isVisible(element)) { // or use: event.target.closest(selector) === null
        element.style.display = 'none'
        removeClickListener()
      }
  }

  const removeClickListener = () => {
      document.removeEventListener('click', outsideClickListener)
  }

  document.addEventListener('click', outsideClickListener)
}

const isVisible = elem => !!elem && !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length ) // source (2018-03-11): https://github.com/jquery/jquery/blob/master/src/css/hiddenVisibleSelectors.js
