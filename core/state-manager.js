import { EVENTS, GAME_STATUSES, MOVING_DIRECTIONS } from "./constants.js";

const _state = {
  gameStatus: GAME_STATUSES.SETTINGS,
  settings: {
    gridSize: {
      rowsCount: 8,
      columnsCount: 8,
    },
    googleJumpInterval: 4000,
    pointsToLose: 10,
    pointsToWin: 10,
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

function notifyObservers(name, payload) {
  const event = {
    name,
    payload,
  };

  _observers.forEach((o) => {
    try {
      o(event);
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

    var isNewPositionMatchWithGooglePosition = newPosition.x === _state.positions.google.x && newPosition.y === _state.positions.google.y; // можно заменить функциями ниже _doesPositionMathWithPlayer1Position
    var isNewPositionMatchWithPlayer1Position = newPosition.x === _state.positions.players[0].x && newPosition.y === _state.positions.players[0].y; // можно заменить функциями ниже _doesPositionMathWithPlayer2Position
    var isNewPositionMatchWithPlayer2Position = newPosition.x === _state.positions.players[1].x && newPosition.y === _state.positions.players[1].y; // можно заменить функциями ниже _doesPositionMathWithGooglePosition
  } while (isNewPositionMatchWithGooglePosition || isNewPositionMatchWithPlayer1Position || isNewPositionMatchWithPlayer2Position);

  _state.positions.google = newPosition;
}

function _isPositionInValidRange(position) {
  if (position.x < 0 || position.x >= _state.settings.gridSize.columnsCount) return false;
  if (position.y < 0 || position.y >= _state.settings.gridSize.rowsCount) return false;

  return true;
}
function _doesPositionMathWithPlayer1Position(newPosition) {
  return newPosition.x === _state.positions.players[0].x && newPosition.y === _state.positions.players[0].y;
}
function _doesPositionMathWithPlayer2Position(newPosition) {
  return newPosition.x === _state.positions.players[1].x && newPosition.y === _state.positions.players[1].y;
}
function _doesPositionMathWithGooglePosition(newPosition) {
  return newPosition.x === _state.positions.google.x && newPosition.y === _state.positions.google.y;
}

function _catchGoogle(playerNumber) {
  const playerIndex = _getPlayerIndexByNumber(playerNumber);
  _state.points.players[playerIndex]++; //увеличиваем балы при выигрыше
  notifyObservers(EVENTS.SCORES_CHANGED);

  if (_state.points.players[playerIndex] === _state.settings.pointsToWin) {
    _state.gameStatus = GAME_STATUSES.WIN;
    notifyObservers(EVENTS.STATUS_CHANGED);
    clearInterval(googleJumpInterval);
  } else {
    const oldPosition = _state.positions.google;
    _jumpGoogleToNewPosition();
    notifyObservers(EVENTS.GOOGLE_JUMPED, {
      oldPosition,
      newPosition: _state.positions.google,
    });
  }
}
// GETTERS/SELECTORS
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

//validation
function _getPlayerIndexByNumber(playerNumber) {
  const playerIndex = playerNumber - 1;

  if (playerIndex < 0 || playerIndex > _state.points.players.length - 1) {
    throw new Error("Incorrect player number");
  }

  return playerIndex;
}

let googleJumpInterval;

// COMMANDS/SETTERS
export async function start() {
  if (_state.gameStatus !== GAME_STATUSES.SETTINGS) throw new Error(`Incorrect transition from ${_state.gameStatus} to "${GAME_STATUSES.IN_PROGRESS}"`);

  _state.gameStatus = GAME_STATUSES.IN_PROGRESS;

  _state.positions.players[0] = { x: 0, y: 0 };
  _state.positions.players[1] = { x: _state.settings.gridSize.columnsCount - 1, y: _state.settings.gridSize.rowsCount - 1 };

  _state.points.google = 0;
  _state.points.players = [0, 0];

  _jumpGoogleToNewPosition();

  googleJumpInterval = setInterval(() => {
    const prevPosition = { ..._state.positions.google }; //берем координаты до начала прыжка
    _jumpGoogleToNewPosition();

    notifyObservers(EVENTS.GOOGLE_JUMPED, {
      oldPosition: prevPosition, //вставляем координаты до начала прыжка
      newPosition: { ..._state.positions.google }, //вставляем координаты после прыжка
    });

    _state.points.google++;

    notifyObservers(EVENTS.SCORES_CHANGED, {});

    if (_state.points.google === _state.settings.pointsToLose) {
      clearInterval(googleJumpInterval);
      _state.gameStatus = GAME_STATUSES.LOSE;
      notifyObservers(EVENTS.STATUS_CHANGED, {});
    }
  }, _state.settings.googleJumpInterval);

  _state.gameStatus = GAME_STATUSES.IN_PROGRESS;
  notifyObservers(EVENTS.STATUS_CHANGED, {});
}

export async function restart() {
  _state.gameStatus = GAME_STATUSES.SETTINGS;
  notifyObservers(EVENTS.STATUS_CHANGED, {});
}

export async function movePlayer(playerNumber, direction) {
  if (_state.gameStatus !== GAME_STATUSES.IN_PROGRESS) return; //прерывание при попытку двигать игрока до начала игры

  const playerIndex = _getPlayerIndexByNumber(playerNumber);
  const oldPosition = { ..._state.positions.players[playerIndex] };
  const newPosition = { ..._state.positions.players[playerIndex] };

  switch (direction) {
    case MOVING_DIRECTIONS.UP:
      newPosition.y--;
      break;
    case MOVING_DIRECTIONS.DOWN:
      newPosition.y++;
      break;
    case MOVING_DIRECTIONS.LEFT:
      newPosition.x--;
      break;
    case MOVING_DIRECTIONS.RIGHT:
      newPosition.x++;
      break;
  }

  const isValidRange = _isPositionInValidRange(newPosition);
  if (!isValidRange) return;

  const isPlayer1PositionTheSame = _doesPositionMathWithPlayer1Position(newPosition);
  if (isPlayer1PositionTheSame) return;

  const isPlayer2PositionTheSame = _doesPositionMathWithPlayer2Position(newPosition);
  if (isPlayer2PositionTheSame) return;

  const isGooglePositionTheSame = _doesPositionMathWithGooglePosition(newPosition);
  if (isGooglePositionTheSame) {
    _catchGoogle(playerNumber);
  }

  _state.positions.players[playerIndex] = newPosition;

  notifyObservers(EVENTS[`PLAYER${playerNumber}_MOVED`], {
    oldPosition,
    newPosition,
  });
}
