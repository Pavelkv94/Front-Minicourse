import { GAME_STATUSES } from "./constants.js";

const _state = {
  gameStatus: GAME_STATUSES.SETTINGS,
  settings: {
    gridSize: {
      rowsCount: 4,
      columnsCount: 4,
    },
    googleJumpInterval: 1000,
    pointsToLose: 5,
    pointsToWin: 5,
  },
  positions: {
    google: {
      x: 1,
      y: 1,
    },
    players: [
      { x: 2, y: 3 },
      { x: 3, y: 3 },
    ],
  },
  points: {
    google: 0,
    players: [0, 0],
  },
};

//OBSERVER
let _observers = [];

export function subscribe(observer) {
  _observers.push(observer);
}

export function unsubscribe(observer) {
  _observers = _observers.filter((o) => o !== observer);
}

function notifyObservers() {
  _observers.forEach((o) => {
    try {
      o();
    } catch (error) {
      console.log(error);
    }
  });
}

function _generateNewIntegerNumber(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function _jumpGoogleToNewPosition() {
  const newPosition = { ..._state.positions.google };

  do {
    newPosition.x = _generateNewIntegerNumber(0, _state.settings.gridSize.columnsCount - 1);
    newPosition.y = _generateNewIntegerNumber(0, _state.settings.gridSize.rowsCount - 1);

    var isNewPositionMatchWithGooglePosition = newPosition.x === _state.positions.google.x && newPosition.y === _state.positions.google.y;
    var isNewPositionMatchWithPlayer1Position = newPosition.x === _state.positions.players[0].x && newPosition.y === _state.positions.players[0].y;
    var isNewPositionMatchWithPlayer2Position = newPosition.x === _state.positions.players[1].x && newPosition.y === _state.positions.players[1].y;
  } while (isNewPositionMatchWithGooglePosition || isNewPositionMatchWithPlayer1Position || isNewPositionMatchWithPlayer2Position);

  _state.positions.google = newPosition;
}

//validation
function _getPlayerIndexByNumber(playerNumber) {
  const playerIndex = playerNumber - 1;

  if (playerIndex < 0 || playerIndex > _state.points.players.length - 1) {
    throw new Error("Incorrect player number");
  }

  return playerIndex;
}

let googleJumpInterval;

//INTERFACES
export async function getGooglePoints() {
  return _state.points.google;
}

export async function getPlayerPoints(playerNumber) {
  const playerIndex = _getPlayerIndexByNumber(playerNumber);

  return _state.points.players[playerIndex];
}

export async function getGridSize() {
  return { ..._state.settings.gridSize }; //immutable
}

export async function getGooglePosition() {
  return { ..._state.positions.google }; //immutable
}

export async function getPlayerPosition(playerNumber) {
  const playerIndex = _getPlayerIndexByNumber(playerNumber);

  return { ..._state.positions.players[playerIndex] };
}

export async function getGameStatus() {
  return _state.gameStatus;
}

export async function start() {
  if (_state.gameStatus !== GAME_STATUSES.SETTINGS) throw new Error(`Incorrect transition from ${_state.gameStatus} to "${GAME_STATUSES.IN_PROGRESS}"`);

  _state.gameStatus = GAME_STATUSES.IN_PROGRESS;

  _state.positions.players[0] = { x: 0, y: 0 };
  _state.positions.players[1] = { x: _state.settings.gridSize.columnsCount - 1, y: _state.settings.gridSize.rowsCount - 1 };

  _state.points.google = 0;
  _state.points.players = [0, 0];

  _jumpGoogleToNewPosition();

  googleJumpInterval = setInterval(() => {
    _jumpGoogleToNewPosition();
    console.log(_state.positions.google);

    _state.points.google++;

    notifyObservers();

    if (_state.points.google === _state.settings.pointsToLose) {
      clearInterval(googleJumpInterval);
      _state.gameStatus = GAME_STATUSES.LOSE;
      notifyObservers();
    }
  }, _state.settings.googleJumpInterval);
  notifyObservers();
}

export async function restart() {
  _state.gameStatus = GAME_STATUSES.SETTINGS;
  notifyObservers();
}
