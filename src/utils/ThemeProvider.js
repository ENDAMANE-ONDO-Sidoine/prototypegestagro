import React, { createContext, useState, useContext } from "react";
import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

export const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
    const [mode, setMode] = useState("light");

    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
    };

    const theme = createTheme({
        palette: {
            mode,
            primary: {
                main: mode === "light" ? "#2E7D32" : "#66BB6A", // Vert clair ou foncé
            },
            secondary: {
                main: mode === "light" ? "#1976D2" : "#90CAF9", // Bleu clair ou foncé
            },
        },
        typography: {
            fontFamily: "Roboto, sans-serif",
        },
    });

    return (
        <ThemeContext.Provider value={{ mode, toggleTheme }}>
            <MuiThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeProvider;
