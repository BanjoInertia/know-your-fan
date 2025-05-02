import React, { useState, useEffect } from 'react';
import AppRoutes from './pages/routes';
import ThemeSwitcher from './components/themeSwitcher/themeSwitcher';
import './App.css';

function App() {
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
    } catch (error) {
      console.error("Não foi possível salvar o tema no localStorage:", error);
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    };

    if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleChange);
    }

    return () => {
        if (mediaQuery.removeEventListener) {
            mediaQuery.removeEventListener('change', handleChange);
        } else if (mediaQuery.removeListener) {
            mediaQuery.removeListener(handleChange);
        }
    };

  }, [theme]);

  return (
    <>
      <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 1000 }}>
         <ThemeSwitcher currentTheme={theme} setTheme={setTheme} />
      </div>

      <AppRoutes />
    </>
  );
}

export default App;