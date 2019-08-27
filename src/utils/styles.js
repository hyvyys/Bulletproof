import getId from "./id";

export default {
  add(css, { id = "" } = {}) {
    if (id) {
      const existing = document.getElementById(id);
      if (existing) {
        existing.parentNode.removeChild(existing);
      }
    } else {
      id = getId();
    }

    var newStyle = document.createElement("style");
    newStyle.appendChild(document.createTextNode(css));
    newStyle.id = id;

    document.head.appendChild(newStyle);
  }
};
