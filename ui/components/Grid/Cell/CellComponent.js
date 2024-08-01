import { EVENTS } from "../../../../core/constants.js";
import { getGooglePosition, getPlayerPosition, subscribe, unsubscribe } from "../../../../core/state-manager.js";
import { GoogleComponent } from "../../common/Google/GoogleComponent.js";
import { PlayerComponent } from "../../common/Player/PlayerComponent.js";

export function CellComponent(x, y) {
  // console.log("CELL CREATED");
  const element = document.createElement("td");

  const observer = (event) => {
    if ([EVENTS.GOOGLE_JUMPED, EVENTS.PLAYER1_MOVED, EVENTS.PLAYER2_MOVED].every(name => name !== event.name)) return;

    if (event.payload.oldPosition.x === x && event.payload.oldPosition.y === y) {
      render(element, x, y);
    }
    if (event.payload.newPosition.x === x && event.payload.newPosition.y === y) {
      render(element, x, y);
    }
  };

  subscribe(observer);

  render(element, x, y);

  return {
    element,
    cleanup: () => {
      console.log("CLEANUP CELL");
      unsubscribe(observer);
    },
  };
}

async function render(element, x, y) {
  element.innerHTML = "";

  // console.log("CELL RENDER");

  const googlePosition = await getGooglePosition();
  const player1Position = await getPlayerPosition(1);
  const player2Position = await getPlayerPosition(2);

  if (googlePosition.x === x && googlePosition.y === y) {
    element.append(GoogleComponent().element);
  }

  if (player1Position.x === x && player1Position.y === y) {
    element.append(PlayerComponent(1).element);
  }

  if (player2Position.x === x && player2Position.y === y) {
    element.append(PlayerComponent(2).element);
  }
}
