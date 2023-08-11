import { createContext, useContext, useState } from 'react';

const AppContext = createContext<{
  // loading
  loading: boolean;
  setLoading: (val: boolean) => void;

  // game
  game: boolean;
  setGame: (val: boolean) => void;
} | null>(null);

export function AppProvider({
  children,
}: {
  children: React.ReactElement | React.ReactElement[];
}): JSX.Element {
  const query = new URLSearchParams(window.location.search);
  const [loading, setLoading] = useState(false);

  // a convenient way to omit menu by appending ?startAt=game in the URL
  const startAtGame = query.get('startAt') === 'game';
  const [game, setGame] = useState(startAtGame);
  const value = { loading, setLoading, game, setGame };

  return (
    <>
      <AppContext.Provider value={value}>{children}</AppContext.Provider>
    </>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
