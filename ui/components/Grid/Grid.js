import { MOVING_DIRECTIONS } from "../../../core/constants.js";
import { getGridSize, movePlayer } from "../../../core/state-manager.js";
import { CellComponent } from "./Cell/CellComponent.js";

export function Grid() {
  const localState = { cleanupFunctions: [] };

  const keyUpObserver = (e) => {
    switch (e.code) {
      case "ArrowUp":
        movePlayer(1, MOVING_DIRECTIONS.UP);
        break;
      case "ArrowDown":
        movePlayer(1, MOVING_DIRECTIONS.DOWN);
        break;
      case "ArrowLeft":
        movePlayer(1, MOVING_DIRECTIONS.LEFT);
        break;
      case "ArrowRight":
        movePlayer(1, MOVING_DIRECTIONS.RIGHT);
        break;

      case "KeyW":
        movePlayer(2, MOVING_DIRECTIONS.UP);
        break;
      case "KeyS":
        movePlayer(2, MOVING_DIRECTIONS.DOWN);
        break;
      case "KeyA":
        movePlayer(2, MOVING_DIRECTIONS.LEFT);
        break;
      case "KeyD":
        movePlayer(2, MOVING_DIRECTIONS.RIGHT);
        break;
    }
  };

  document.addEventListener("keyup", keyUpObserver);

  // console.log("GRID CREATING");
  const element = document.createElement("table");

  element.classList.add("grid");

  // const observer = () => render(element) //todo вместо отрисовки грида отрисовываем ячейки
  // subscribe(observer);

  render(element, localState);

  return {
    element,
    cleanup: () => {
      // unsubscribe(observer)
      localState.cleanupFunctions.forEach((cf) => cf()); //поменщаем зачистку всех дочерних елементов
      document.removeEventListener("keyup", keyUpObserver);
    },
  };
}

async function render(element, localState) {
  // console.log("GRID RENDER");

  localState.cleanupFunctions.forEach((cf) => cf());
  localState.cleanupFunctions = [];

  element.innerHTML = "";

  const gridSize = await getGridSize();

  for (let y = 0; y < gridSize.rowsCount; y++) {
    const rowElement = document.createElement("tr");

    for (let x = 0; x < gridSize.columnsCount; x++) {
      const cellElement = CellComponent(x, y);
      localState.cleanupFunctions.push(cellElement.cleanup);
      rowElement.append(cellElement.element);
    }

    element.append(rowElement);
  }
}
