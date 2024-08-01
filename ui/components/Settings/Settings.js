import { subscribe, unsubscribe } from "../../../core/state-manager.js";

export function Settings() {
  const element = document.createElement("div");

  render(element)

  return { element, cleanup: () => { } };
}

async function render(element) {
  element.append(`Settings will be here`);
}
