import { restart } from "../../../core/state-manager.js";

export function Win() {
  const element = document.createElement("div");

  render(element);

  return { element };
}

async function render(element) {
  const titleElement = document.createElement("h1")
  titleElement.append(`YOU WIN !!!!!!.`);

  element.append(titleElement);

  const button = document.createElement("button");
  button.append("restart game");
  button.addEventListener("click", () => {
    restart();
  });
  element.append(button);
}
