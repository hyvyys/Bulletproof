export default function trackMouse(element, mouseEvent, callback) {
  function handler(e) {
    var x = e.pageX;
    var y = e.pageY;
    console.log(x, y);
    callback({ x, y });
  }
  element.addEventListener(mouseEvent, handler);
}
