import { subscribe, unsubscribe } from "../../../core/state-manager.js";

export function Settings() {
  const element = document.createElement("div");

  const observer = () => render(element)
  subscribe(observer);

  return { element, cleanup: () => { unsubscribe(observer) } };
}

async function render(element) {
  element.append(`Settings will be here`);
}
