import { subscribe } from "../core/state-manager.js";
import { App } from "./components/App.js";

const rootElement = document.getElementById("root");

rootElement.innerHTML = "";

const appComponent = App();

rootElement.append(appComponent.element);
