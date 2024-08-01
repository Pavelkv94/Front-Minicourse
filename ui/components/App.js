import { GAME_STATUSES } from "../../core/constants.js";
import { getGameStatus, subscribe } from "../../core/state-manager.js";
import { Grid } from "./Grid/Grid.js";
import { Lose } from "./LoseComponent/LoseComponent.js";
import { ResultPanel } from "./ResultPanel/ResultPanel.js";
import { Settings } from "./Settings/Settings.js";
import { Start } from "./StartComponents/Start.js";
import { Win } from "./WinComponent/Win.js";

export function App() {
  const localState = { prevGameStatus: null, cleanupFunctions: [] };
  console.log("APP CREATING");
  const element = document.createElement("div");

  subscribe(() => render(element, localState));

  render(element, localState);

  return { element };
}

async function render(element, localState) {
  const status = await getGameStatus();

  if (localState.prevGameStatus === status) return;
  localState.prevGameStatus = status;

  localState.cleanupFunctions.forEach((cf) => cf()); //вызвали cleanup функции
  localState.cleanupFunctions = []; //зачистили cleanup функции

  element.innerHTML = "";

  console.log("APP RENDERING");

  switch (status) {
    case GAME_STATUSES.SETTINGS: {
      const settingsComponent = Settings();
      const startComponent = Start();

      element.append(settingsComponent.element, startComponent.element);
      break;
    }

    case GAME_STATUSES.IN_PROGRESS:
      const settingsComponent = Settings();
      localState.cleanupFunctions.push(settingsComponent.cleanup); //собираем в стейт функции зачистки

      const resultPanelComponent = ResultPanel();
      localState.cleanupFunctions.push(resultPanelComponent.cleanup); //собираем в стейт функции зачистки

      const gridComponent = Grid();
      localState.cleanupFunctions.push(gridComponent.cleanup); //собираем в стейт функции зачистки

      element.append(settingsComponent.element, resultPanelComponent.element, gridComponent.element);
      break;
    case GAME_STATUSES.LOSE:
      const loseComponent = Lose();
      element.append(loseComponent.element);
      break;
    case GAME_STATUSES.WIN:
      const winComponent = Win();
      element.append(winComponent.element);
      break;
    default:
      throw new Error("not implemented");
  }
}
