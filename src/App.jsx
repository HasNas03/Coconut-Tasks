import { useEffect, useState } from 'react';
import './App.css';
import List from './List.jsx';
import LoadingScreen from './LoadingScreen';

function App() {
  const [showLoader, setShowLoader] = useState(true);
  const [loaderIsRevealing, setLoaderIsRevealing] = useState(false);

  useEffect(() => {
    if (!showLoader) {
      return undefined;
    }

    document.body.classList.add('portfolio-is-loading');
    const revealTimeout = window.setTimeout(() => {
      setLoaderIsRevealing(true);
    }, 1500);
    const hideTimeout = window.setTimeout(() => {
      setShowLoader(false);
    }, 2000);

    return () => {
      window.clearTimeout(revealTimeout);
      window.clearTimeout(hideTimeout);
      document.body.classList.remove('portfolio-is-loading');
    };
  }, [showLoader]);

  return (
    <>
      <List />
      {showLoader && <LoadingScreen isRevealing={loaderIsRevealing} />}
    </>
  );
}

export default App;
