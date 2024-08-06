import { EVENTS } from "../../../core/constants.js";
import { subscribe } from "../../../core/state-manager.js";

export function AudioComponent() {
  const missAudio = new Audio("assets/sounds/miss.mp3");
  const catchAudio = new Audio("assets/sounds/catch.wav");

  subscribe((e) => {
    if (e.name === EVENTS.GOOGLE_RUN_AWAY) {
      missAudio.play();
    }
    if (e.name === EVENTS.GOOGLE_CAUGHT) {
        catchAudio.currentTime = 0;
        catchAudio.play();
      }
  });
}
