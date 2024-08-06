import { EVENTS } from "../../../../core/constants.js";
import { getGooglePosition, getPlayerPosition, subscribe, unsubscribe } from "../../../../core/state-manager.js";
import { GoogleComponent } from "../../common/Google/GoogleComponent.js";
import { PlayerComponent } from "../../common/Player/PlayerComponent.js";

export function CellComponent(x, y) {
  // console.log("CELL CREATED");
  const element = document.createElement("td");
  // const localState = { rendering: false }; //для управления лишними перерендерами(чтобы не двоились)
  const localState = { renderVersion: 0 };
  const observer = (event) => {
    if ([EVENTS.GOOGLE_JUMPED, EVENTS.PLAYER1_MOVED, EVENTS.PLAYER2_MOVED].every((name) => name !== event.name)) return;

    if (event.payload.oldPosition.x === x && event.payload.oldPosition.y === y) {
      render(element, x, y, localState);
    }
    if (event.payload.newPosition.x === x && event.payload.newPosition.y === y) {
      render(element, x, y, localState);
    }
  };

  subscribe(observer);

  render(element, x, y, localState);

  return {
    element,
    cleanup: () => {
      console.log("CLEANUP CELL");
      unsubscribe(observer);
    },
  };
}
//todo
//localState.rendering - первый механизм контроля отрисовок
//localState.renderVersion - второй механизм контроля отрисовок с версионированием

async function render(element, x, y, localState) {
  localState.renderVersion++
  const currentRenderVersion = localState.renderVersion;
  // if(localState.rendering) return;
  // localState.rendering = true;
  element.innerHTML = "";

  console.log("CELL RENDER");

  const googlePosition = await getGooglePosition();
  const player1Position = await getPlayerPosition(1);
  const player2Position = await getPlayerPosition(2);

  if (currentRenderVersion < localState.renderVersion) {
    return;
  }

  if (googlePosition.x === x && googlePosition.y === y) {
    element.append(GoogleComponent().element);
  }

  if (player1Position.x === x && player1Position.y === y) {
    element.append(PlayerComponent(1).element);
  }

  if (player2Position.x === x && player2Position.y === y) {
    element.append(PlayerComponent(2).element);
  }
  // localState.rendering = false;
}
