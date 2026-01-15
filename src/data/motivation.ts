export const MOTIVATIONAL_MESSAGES = [
    "Stay strong. Every moment of resistance builds your strength. 🐉",
    "Your discipline today shapes your freedom tomorrow. Forge ahead.",
    "The only easy day was yesterday. Keep the shield up.",
    "Conquer yourself, conquer the world. Persistence is mandatory.",
    "Pain is temporary. Glory is forever. Do not break the streak.",
    "Hydra protocol: Discipline is the only currency. ⚔️",
    "Discipline is the bridge between goals and accomplishment.",
    "Suffer the pain of discipline or suffer the pain of regret.",
    "Focus on the mission. Your future self is watching.",
    "The dragon is slayed one second at a time. Keep going.",
    "Signals detected: Your will is stronger than your impulses.",
    "Legacy is built in the moments nobody sees. Stay focused.",
    "Operational status: SHIELD ACTIVE. Do not compromise.",
    "You are the master of your fate, the captain of your soul.",
    "Strength does not come from winning. It comes from struggles.",
    "Stop waiting for motivation. Rely on discipline.",
    "The resistance is where the growth happens. Embrace it.",
    "One day at a time, one breath at a time. Zero relapses. 🐉",
    "Your streak is a monument to your willpower. Don't tear it down.",
    "The hardest walk is walking alone, but it's the walk that makes you strongest."
];

export const getRandomMotivation = () => {
    return MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
};
