import getId from "./id";

export default {
  add(css, id = "") {
    if (!id) {
      id = getId();
    }

    var newStyle = document.createElement("style");
    newStyle.appendChild(document.createTextNode(css));

    document.head.appendChild(newStyle);

    if (id) {
      const existing = document.getElementById(id);
      if (existing) {
        existing.parentNode.removeChild(existing);
      }
    }
    newStyle.id = id;
  },

  setProperty(prop, val) {
    document.documentElement.style.setProperty(prop, val);
  },
};
