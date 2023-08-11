import { useEffect } from 'react';
import './App.css';
import { useApp } from './AppContext';
import { Game } from './game/Game';
import { GameProvider } from './game/GameContext';
import Splash from './splash/Splash';
import StartButton from './splash/StartButton';
import Throbber from './splash/Throbber';

export default function App(): JSX.Element {
  const { game, loading, setLoading } = useApp();

  useEffect(() => {
    setLoading(true);

    // simulate loading for now
    const id = setTimeout(() => {
      setLoading(false);
    }, 1200);

    return () => clearTimeout(id);
  }, []);

  return (
    <>
      {!game && <Splash />}
      {!loading && <StartButton />}
      {loading && <Throbber />}

      {game && (
        <GameProvider>
          <Game />
        </GameProvider>
      )}
    </>
  );
}
