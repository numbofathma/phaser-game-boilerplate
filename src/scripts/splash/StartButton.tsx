import { useApp } from '../AppContext';
import './StartButton.css';

export default function StartButton(): JSX.Element {
  const { setGame } = useApp();

  function handleClick() {
    setGame(true);
  }

  return (
    <div className="relativeWrapper">
      <div className="container">
        <button className="startButton" onClick={handleClick}>
          START GAME
        </button>
      </div>
    </div>
  );
}
