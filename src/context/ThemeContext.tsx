import React, { createContext, useContext, useEffect, useState } from 'react';
import { THEMES, ThemeDefinition } from '@/data/themes';
import { Preferences } from '@capacitor/preferences';

interface ThemeContextType {
    currentTheme: ThemeDefinition;
    setTheme: (themeId: string) => Promise<void>;
    unlockedThemes: string[];
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentTheme, setCurrentThemeState] = useState<ThemeDefinition>(THEMES[0]);
    const [unlockedThemes, setUnlockedThemes] = useState<string[]>(["hydra"]);

    useEffect(() => {
        const loadTheme = async () => {
            const { value: storedTheme } = await Preferences.get({ key: 'user_theme' });
            if (storedTheme) {
                const theme = THEMES.find(t => t.id === storedTheme);
                if (theme) {
                    setCurrentThemeState(theme);
                    applyTheme(theme);
                }
            }

            // Check levels for unlocks
            const streakStored = localStorage.getItem('hydra_streak_data');
            if (streakStored) {
                const data = JSON.parse(streakStored);
                const days = calculateDays(data.startDate);
                const unlocked = THEMES.filter(t => days >= t.minDays).map(t => t.id);
                setUnlockedThemes(unlocked);
            }
        };
        loadTheme();

        window.addEventListener('hydra_streak_updated', loadTheme);
        return () => window.removeEventListener('hydra_streak_updated', loadTheme);
    }, []);

    const calculateDays = (startDate: string | null) => {
        if (!startDate) return 0;
        const start = new Date(startDate);
        const now = new Date();
        return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    };

    const applyTheme = (theme: ThemeDefinition) => {
        const root = document.documentElement;
        Object.entries(theme.vars).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });
    };

    const setTheme = async (themeId: string) => {
        const theme = THEMES.find(t => t.id === themeId);
        if (theme) {
            setCurrentThemeState(theme);
            applyTheme(theme);
            await Preferences.set({ key: 'user_theme', value: themeId });
        }
    };

    return (
        <ThemeContext.Provider value={{ currentTheme, setTheme, unlockedThemes }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within ThemeProvider');
    return context;
};
