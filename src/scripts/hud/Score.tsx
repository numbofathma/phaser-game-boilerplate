import { useGame } from '../game/GameContext';
import './hud.css';

export default function Score(): JSX.Element {
  const { state } = useGame();

  return (
    <div id="Score" className="relativeWrapper">
      <div>
        🍎 <span>{state.score}</span>
      </div>
    </div>
  );
}
