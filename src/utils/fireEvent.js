
export default function fireEvent(element, eventName) {
  var event = document.createEvent("HTMLEvents");
  event.initEvent(eventName, true, false);
  element.dispatchEvent(event);
}