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

  ancestor() {
    const range = getSelectionRange(this.container);
    let ancestor = range.commonAncestorContainer;
    if (ancestor.nodeType === Node.TEXT_NODE) {
      ancestor = ancestor.parentNode;
    }
    return ancestor;
  }

  existentTags(tag) {
    const range = getSelectionRange(this.container);
    const fragment = range.cloneContents();
    let existentTags = fragment.querySelectorAll(tag);
    // existentTags = Array.from(existentTags).filter(t => t.innerText);
    return existentTags;
  }

  closestTag(tag) {
    let closestTag = this.ancestor().closest(tag);
    return closestTag;
  }

  containsTag(tag) {
    return this.existentTags(tag).length > 0 || this.closestTag(tag) != null;
  }

  wrap(tag) {
    const isParagraph = /^h[1-6]$/.test(tag);

    let ancestor = this.ancestor();
    // if selection is outside editor; not probable though
    if (!this.container.contains(ancestor)) {
      console.log("not contained")
      return;
    }
    // if (ancestor.tagName === tag.toUpperCase()) {
      //   existentTag = ancestor;
      // }
    const range = getSelectionRange(this.container);
    let fragment = range.cloneContents();
    let existentTags = fragment.querySelectorAll(tag);
    const closestTag = this.closestTag(tag);

    if (closestTag) {
      // console.log('closest');
      const parent = ancestor === closestTag ? ancestor.parentNode : ancestor;
      const tmp = document.createElement('tmp');
      range.surroundContents(tmp);
      const newContent = document.createDocumentFragment();
      Array.from(closestTag.childNodes).forEach(c => {
        try {
          if (c === tmp) {
            newContent.appendChild(c.childNodes[0]);
          }
          else if (c.nodeValue || c.innerText) {
            const newEl = document.createElement(tag);
            newEl.appendChild(c.cloneNode());
            newContent.appendChild(newEl);
          }
        }
        catch (e) {
          console.log(e);
        }
      });
      parent.replaceChild(newContent, closestTag);
    }
    else if (existentTags.length) {
      // console.log(existentTags.length + ' existent ' + tag + 's')
      existentTags.forEach(c => {
        try {
          const fr = document.createDocumentFragment();
          Array.from(c.childNodes).forEach(cc => fr.appendChild(cc));
          c.parentNode.replaceChild(fr, c);
        }
        catch (e) {
          console.log(e);
        }
      });
      range.deleteContents();
      range.insertNode(fragment);
    }
    else
    try {
      const empty = isParagraph && range.toString() === "";
      if (empty) {
        range.insertNode(document.createElement("br"));
      }

      const newParent = document.createElement(tag);
      newParent.appendChild(range.extractContents());
      range.insertNode(newParent);

      if (empty) {
        range.selectNodeContents(newParent);
      }
    }
    catch (e) {
      console.log(e);
      console.log(ancestor)
      // probably selection is partial
    }

    clean(this.container);
  }
}

function clean(node)
{
  for(var n = 0; n < node.childNodes.length; n ++)
  {
    var child = node.childNodes[n];
    if
    (
      child.nodeType === 8
      ||
      (child.nodeType === 3 && !/\S/.test(child.nodeValue))
      || child.innerText === ""
    )
    {
      // console.log('removing node')
      // console.log(node.toString())
      // console.log(child.toString())
      node.removeChild(child);
      n --;
    }
    else if(child.nodeType === 1)
    {
      clean(child);
    }
  }
}
