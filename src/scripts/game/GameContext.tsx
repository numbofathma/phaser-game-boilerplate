import EventEmitter from 'eventemitter3';
import { Dispatch, createContext, useContext, useReducer } from 'react';
import { logAs } from './systems/Logger';

export type GameActions = 'addScore' | 'takeLife';
export type GameState = { score: number; lives: number };
export type GameDispatch = Dispatch<GameAction>;

type GameAction = Record<string, any> & { type: GameActions };
const GameContext = createContext<{ state: GameState; dispatch: GameDispatch } | null>(null);

export function GameProvider({
  children,
}: {
  children: React.ReactElement | React.ReactElement[];
}): JSX.Element {
  const query = new URLSearchParams(window.location.search);

  const [state, dispatch] = useReducer(gameReducer, {
    score: 0,
    lives: parseInt(query.get('lives') ?? '') || 3,
  });

  return (
    <>
      <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>
    </>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}

export const gameEvents = new EventEmitter<GameAction['type']>();

export class ActionAddScore implements GameAction {
  readonly type: GameActions = 'addScore';
  constructor(public points: number) {}
}

export class ActionTakeLife implements GameAction {
  readonly type: GameActions = 'takeLife';
  constructor() {}
}

function gameReducer(state: GameState, action: GameAction) {
  let newState: GameState;
  switch (action.type) {
    case 'addScore':
      const points = action.points ?? 1;
      logAs('gameReducer', 'Add score: ' + points);
      newState = {
        ...state,
        score: state.score + points,
      };
      break;

    case 'takeLife':
      logAs('gameReducer', 'Life lost. Remaining: ' + (state.lives - 1));
      newState = {
        ...state,
        lives: state.lives - 1,
      };
      break;

    default:
      throw Error(`Unknown action ${action.type}`);
  }

  // the way to broadcast new state and actions to Phaser world
  gameEvents.emit(action.type, { action, oldState: state, state: newState });

  return newState;
}
