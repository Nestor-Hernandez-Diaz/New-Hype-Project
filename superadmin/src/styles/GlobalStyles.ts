import { createGlobalStyle } from 'styled-components';
import { COLORS, TYPOGRAPHY } from './theme';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    height: 100%;
    font-family: ${TYPOGRAPHY.fontFamily.base};
    font-size: ${TYPOGRAPHY.fontSize.base};
    line-height: ${TYPOGRAPHY.lineHeight.normal};
    color: ${COLORS.text};
    background-color: ${COLORS.background};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: ${TYPOGRAPHY.fontWeight.semibold};
    line-height: ${TYPOGRAPHY.lineHeight.tight};
    color: ${COLORS.text};
  }

  h1 { font-size: ${TYPOGRAPHY.fontSize['3xl']}; }
  h2 { font-size: ${TYPOGRAPHY.fontSize['2xl']}; }
  h3 { font-size: ${TYPOGRAPHY.fontSize.xl}; }
  h4 { font-size: ${TYPOGRAPHY.fontSize.lg}; }
  h5 { font-size: ${TYPOGRAPHY.fontSize.base}; }
  h6 { font-size: ${TYPOGRAPHY.fontSize.sm}; }

  a {
    color: ${COLORS.primary};
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: ${COLORS.primaryDark};
    }
  }

  button {
    font-family: inherit;
    cursor: pointer;
  }

  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${COLORS.background};
  }

  ::-webkit-scrollbar-thumb {
    background: ${COLORS.borderDark};
    border-radius: 4px;

    &:hover {
      background: ${COLORS.textLighter};
    }
  }
`;
