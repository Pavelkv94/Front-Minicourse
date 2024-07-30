import { getGridSize, subscribe, unsubscribe } from "../../../core/state-manager.js";
import { CellComponent } from "./Cell/CellComponent.js";

export function Grid() {

  console.log("GRID CREATING");
  const element = document.createElement("table");

  element.classList.add("grid");

  const observer = () => render(element)
  subscribe(observer);

  render(element);

  return { element, cleanup: () => { unsubscribe(observer) } };
}

async function render(element) {
  console.log("GRID RENDER");

  element.innerHTML = "";

  
  const gridSize = await getGridSize();

  for (let y = 0; y < gridSize.rowsCount; y++) {
    const rowElement = document.createElement("tr");

    for (let x = 0; x < gridSize.columnsCount; x++) {
      const cellElement = CellComponent(x, y);
      rowElement.append(cellElement.element);
    }

    element.append(rowElement);
  }
}
