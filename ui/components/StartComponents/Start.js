import { start } from "../../../core/state-manager.js";

export function Start() {
  const element = document.createElement("div");

  render(element);

  return { element };
}

async function render(element) {
  const button = document.createElement("button");
  button.append("start game");
  button.addEventListener("click", () => {
    start();
  });
  element.append(button);
}
