// https://stackoverflow.com/a/17694760/6805143

var saveSelection, restoreSelection, getSelectionRange;

if (window.getSelection && document.createRange) {
  getSelectionRange = function () {
    const sel = window.getSelection();
    return sel.rangeCount >= 1 && sel.getRangeAt(0);
  }

  saveSelection = function (containerEl) {
    var doc = containerEl.ownerDocument, win = doc.defaultView;
    var range = win.getSelection().getRangeAt(0);
    var preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(containerEl);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    var start = preSelectionRange.toString().length;

    return {
      start: start,
      end: start + range.toString().length,
    };
  };

  restoreSelection = function (containerEl, savedSel) {
    var doc = containerEl.ownerDocument, win = doc.defaultView;
    var charIndex = 0, range = doc.createRange();
    range.setStart(containerEl, 0);
    range.collapse(true);
    var nodeStack = [containerEl], node, foundStart = false, stop = false;

    while (!stop && (node = nodeStack.pop())) {
      if (node.nodeType == 3) {
        var nextCharIndex = charIndex + node.length;
        if (!foundStart && savedSel.start >= charIndex && savedSel.start <= nextCharIndex) {
          range.setStart(node, savedSel.start - charIndex);
          foundStart = true;
        }
        if (foundStart && savedSel.end >= charIndex && savedSel.end <= nextCharIndex) {
          range.setEnd(node, savedSel.end - charIndex);
          stop = true;
        }
        charIndex = nextCharIndex;
      } else {
        var i = node.childNodes.length;
        while (i--) {
          nodeStack.push(node.childNodes[i]);
        }
      }
    }

    var sel = win.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  };
} else if (document.selection) {
  saveSelection = function (containerEl) {
    var doc = containerEl.ownerDocument;
    var selectedTextRange = doc.selection.createRange();
    var preSelectionTextRange = doc.body.createTextRange();
    preSelectionTextRange.moveToElementText(containerEl);
    preSelectionTextRange.setEndPoint("EndToStart", selectedTextRange);
    var start = preSelectionTextRange.text.length;

    return {
      start: start,
      end: start + selectedTextRange.text.length,
    };
  };

  restoreSelection = function (containerEl, savedSel) {
    var doc = containerEl.ownerDocument;
    var textRange = doc.body.createTextRange();
    textRange.moveToElementText(containerEl);
    textRange.collapse(true);
    textRange.moveEnd("character", savedSel.end);
    textRange.moveStart("character", savedSel.start);
    textRange.select();
  };
}

export default class DomSelection {
  constructor(container) {
    this.selection = null;
    this.container = container;
  }

  get remembered() {
    return this.selection !== null;
  }

  save() {
    this.selection = saveSelection(this.container);
  }

  restore() {
    if (this.selection) {
      restoreSelection(this.container, this.selection);
    }
  }

  forget() {
    this.selection = null;
  }

  wrap(tag) {
    const isParagraph = /^h[1-6]$/.test(tag);

    const range = getSelectionRange(this.container);

    let ancestor = range.commonAncestorContainer;
    if (ancestor.nodeType === Node.TEXT_NODE) {
      ancestor = ancestor.parentNode;
    }

    // if selection is outside editor
    if (!this.container.contains(ancestor)) {
      return;
    }

    const fragment = range.cloneContents();
    let existentTag = fragment.querySelector(tag);

    if (ancestor.tagName === tag.toUpperCase()) {
      existentTag = ancestor;
    }

    if (!existentTag) {
      const empty = isParagraph && range.toString() === "";
      if (empty) {
        range.insertNode(document.createElement("br"));
      }
      const newParent = document.createElement(tag);

      try {
        range.surroundContents(newParent);
        if (empty) {
          range.selectNodeContents(newParent);
        }
      }
      catch {
        // probably selection is partial
      }
    }
    else {
      const contents = document.createDocumentFragment();
      existentTag.childNodes.forEach(n => contents.appendChild(n));
      existentTag.parentNode.replaceChild(contents, existentTag);
      range.deleteContents();
      range.insertNode(fragment);
    }
  }
}
