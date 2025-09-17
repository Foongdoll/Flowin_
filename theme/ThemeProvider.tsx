import React, { PropsWithChildren, createContext, useContext } from 'react';
import tokens from './tokens';

type ThemeContextValue = {
  tokens: typeof tokens;
};

const ThemeTokensContext = createContext<ThemeContextValue>({ tokens });

export const useThemeTokens = () => useContext(ThemeTokensContext).tokens;

export function ThemeProvider({ children }: PropsWithChildren) {
  return (
    <ThemeTokensContext.Provider value={{ tokens }}>
      {children}
    </ThemeTokensContext.Provider>
  );
}
