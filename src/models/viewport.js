export default {
  get width() {
    return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  },
  get height() {
    return Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  },
};
