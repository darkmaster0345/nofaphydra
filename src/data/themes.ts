export interface ThemeDefinition {
    id: string;
    name: string;
    minDays: number;
    description: string;
    preview: string; // Color code for preview
    vars: Record<string, string>;
}

export const THEMES: ThemeDefinition[] = [
    {
        id: "fursan",
        name: "Fursan Royal",
        minDays: 0,
        description: "The official Gold and Cream theme of the protocol.",
        preview: "#F5C842",
        vars: {
            "--background": "45 50% 96%",
            "--foreground": "30 20% 15%",
            "--primary": "43 96% 56%",
            "--primary-foreground": "30 20% 10%",
            "--secondary": "39 35% 92%",
            "--secondary-foreground": "30 20% 20%",
            "--border": "43 40% 75%",
            "--accent": "145 50% 40%",
            "--ring": "43 96% 56%",
            "--card": "45 40% 98%",
            "--card-foreground": "30 20% 15%",
            "--muted": "45 30% 85%",
            "--muted-foreground": "30 10% 40%"
        }
    },
    {
        id: "midnight",
        name: "Midnight Master",
        minDays: 60,
        description: "Unlocked at Master level.",
        preview: "#1e293b",
        vars: {
            "--background": "222 47% 11%",
            "--foreground": "210 40% 98%",
            "--primary": "210 40% 98%",
            "--primary-foreground": "222 47% 11%",
            "--secondary": "217 32% 17%",
            "--secondary-foreground": "210 40% 90%",
            "--border": "217 32% 25%",
            "--accent": "210 40% 98%",
            "--ring": "210 40% 98%",
            "--card": "222 47% 13%",
            "--card-foreground": "210 40% 98%",
            "--muted": "217 32% 15%",
            "--muted-foreground": "215 20% 65%"
        }
    },
    {
        id: "solar",
        name: "Solar Legend",
        minDays: 90,
        description: "Unlocked at Faris level.",
        preview: "#f59e0b",
        vars: {
            "--background": "30 20% 98%",
            "--foreground": "30 50% 5%",
            "--primary": "38 92% 50%",
            "--primary-foreground": "0 0% 100%",
            "--secondary": "30 20% 94%",
            "--secondary-foreground": "30 50% 10%",
            "--border": "30 20% 85%",
            "--accent": "38 92% 50%",
            "--ring": "38 92% 50%",
            "--card": "30 20% 99%",
            "--card-foreground": "30 50% 5%",
            "--muted": "30 20% 90%",
            "--muted-foreground": "30 20% 40%"
        }
    },
    {
        id: "void",
        name: "Void Immortal",
        minDays: 180,
        description: "Unlocked at Immortal level.",
        preview: "#000000",
        vars: {
            "--background": "0 0% 0%",
            "--foreground": "280 100% 70%",
            "--primary": "280 100% 70%",
            "--primary-foreground": "0 0% 0%",
            "--secondary": "0 0% 10%",
            "--secondary-foreground": "280 100% 60%",
            "--border": "280 100% 30%",
            "--accent": "280 100% 70%",
            "--ring": "280 100% 70%",
            "--card": "0 0% 5%",
            "--card-foreground": "280 100% 70%",
            "--muted": "0 0% 15%",
            "--muted-foreground": "280 50% 40%"
        }
    }
];
