self.window = {};
const opentype = require("opentype.js");

self.onmessage = function (e) {
  const { url, fileName } = e.data;
  opentype.load(url, (error, font) => {
    if (error) {
      self.postMessage({ url, fileName, error: error.message });
    }
    else {
      self.postMessage({ url, fileName, font });
    }
  });
};
