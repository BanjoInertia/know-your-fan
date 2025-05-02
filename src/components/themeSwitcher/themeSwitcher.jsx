import React from 'react';
import Text from '../text/text';

function ThemeSwitcher({ currentTheme, setTheme }) {

  const setLight = () => setTheme('light');
  const setDark = () => setTheme('dark');
  const setOcean = () => setTheme('ocean');
  const setBeige = () => setTheme('beige');
  const setForest = () => setTheme('forest');
  const setSynthwave = () => setTheme('synthwave');
  const setSolarizedLight = () => setTheme('solarized-light');

  const baseButtonStyle = {
    padding: '3px',
    margin: '5px',
    cursor: 'pointer',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--tertiary-color)',
    backgroundColor: 'var(--quaternary-color)',
    color: 'var(--secondary-font-color)',
    borderRadius: '50px',
  };

  const activeButtonStyle = {
    ...baseButtonStyle,
    borderColor: 'var(--secondary-color)',
    backgroundColor: 'var(--secondary-color)',
  };

  return (
    <div style={{ fontFamily: 'Geologica', display: 'flex', alignItems: 'center' }}>
      <Text $mobileFontSize="2rem" $tabletFontSize="2rem" $fontSize="1.2rem" $margin="0 10px" $color="var(--secondary-font-color)">Temas:</Text>
      <button
        style={currentTheme === 'light' ? activeButtonStyle : baseButtonStyle}
        onClick={setLight}
        disabled={currentTheme === 'light'}
      >
        ☀️
      </button>
      <button
        style={currentTheme === 'dark' ? activeButtonStyle : baseButtonStyle}
        onClick={setDark}
        disabled={currentTheme === 'dark'}
      >
        🌙
      </button>
      <button
        style={currentTheme === 'ocean' ? activeButtonStyle : baseButtonStyle}
        onClick={setOcean}
        disabled={currentTheme === 'ocean'}
      >
        🌊
      </button>
      <button
        style={currentTheme === 'beige' ? activeButtonStyle : baseButtonStyle}
        onClick={setBeige}
        disabled={currentTheme === 'beige'}
      >
        🌼
      </button>
      <button
        style={currentTheme === 'forest' ? activeButtonStyle : baseButtonStyle}
        onClick={setForest}
        disabled={currentTheme === 'forest'}
      >
        🌳
      </button>
      <button
        style={currentTheme === 'synthwave' ? activeButtonStyle : baseButtonStyle}
        onClick={setSynthwave}
        disabled={currentTheme === 'synthwave'}
      >
        🎧
      </button>
      <button
        style={currentTheme === 'solarized-light' ? activeButtonStyle : baseButtonStyle}
        onClick={setSolarizedLight}
        disabled={currentTheme === 'solarized-light'}
      >
        🌞
      </button>

    </div>
  );
}

export default ThemeSwitcher;