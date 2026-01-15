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
        id: "hydra",
        name: "Hydra Standard",
        minDays: 0,
        description: "The classic brutalist monochrome look.",
        preview: "#000000",
        vars: {
            "--background": "0 0% 100%",
            "--foreground": "0 0% 0%",
            "--primary": "0 0% 0%",
            "--primary-foreground": "0 0% 100%",
            "--secondary": "0 0% 96%",
            "--border": "0 0% 0%",
            "--accent": "0 0% 96%",
            "--ring": "0 0% 0%"
        }
    },
    {
        id: "emerald",
        name: "Emerald Discipline",
        minDays: 7,
        description: "Unlocked at Warrior level.",
        preview: "#10b981",
        vars: {
            "--background": "160 30% 98%",
            "--foreground": "160 50% 5%",
            "--primary": "160 84% 39%",
            "--primary-foreground": "0 0% 100%",
            "--secondary": "160 20% 94%",
            "--border": "160 20% 85%",
            "--accent": "160 84% 39%",
            "--ring": "160 84% 39%"
        }
    },
    {
        id: "blood",
        name: "Blood Warrior",
        minDays: 14,
        description: "Unlocked at Guardian level.",
        preview: "#ef4444",
        vars: {
            "--background": "0 0% 100%",
            "--foreground": "0 0% 0%",
            "--primary": "0 84% 60%",
            "--primary-foreground": "0 0% 100%",
            "--secondary": "0 0% 96%",
            "--border": "0 0% 0%",
            "--accent": "0 84% 60%",
            "--ring": "0 84% 60%"
        }
    },
    {
        id: "royal",
        name: "Royal Champion",
        minDays: 30,
        description: "Unlocked at Champion level.",
        preview: "#8b5cf6",
        vars: {
            "--background": "250 20% 98%",
            "--foreground": "250 50% 5%",
            "--primary": "262 83% 58%",
            "--primary-foreground": "0 0% 100%",
            "--secondary": "250 20% 94%",
            "--border": "250 20% 85%",
            "--accent": "262 83% 58%",
            "--ring": "262 83% 58%"
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
            "--border": "217 32% 25%",
            "--accent": "210 40% 98%",
            "--ring": "210 40% 98%"
        }
    },
    {
        id: "solar",
        name: "Solar Legend",
        minDays: 90,
        description: "Unlocked at Legend level.",
        preview: "#f59e0b",
        vars: {
            "--background": "30 20% 98%",
            "--foreground": "30 50% 5%",
            "--primary": "38 92% 50%",
            "--primary-foreground": "0 0% 100%",
            "--secondary": "30 20% 94%",
            "--border": "30 20% 85%",
            "--accent": "38 92% 50%",
            "--ring": "38 92% 50%"
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
            "--border": "280 100% 30%",
            "--accent": "280 100% 70%",
            "--ring": "280 100% 70%"
        }
    }
];
