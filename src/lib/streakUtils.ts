export interface StreakData {
  startDate: string | null;
  longestStreak: number;
  totalRelapses: number;
}

export interface AvatarLevel {
  name: string;
  emoji: string;
  minDays: number;
  maxDays: number;
  color: string;
  description: string;
}

export const AVATAR_LEVELS: AvatarLevel[] = [
  { name: "Seedling", emoji: "🌱", minDays: 0, maxDays: 0, color: "text-emerald-400", description: "Planting the seed of change" },
  { name: "Apprentice", emoji: "📚", minDays: 1, maxDays: 6, color: "text-yellow-500", description: "Learning self-control" },
  { name: "Warrior", emoji: "⚔️", minDays: 7, maxDays: 13, color: "text-orange-500", description: "Fighting urges daily" },
  { name: "Guardian", emoji: "🛡️", minDays: 14, maxDays: 29, color: "text-blue-500", description: "Protecting your progress" },
  { name: "Champion", emoji: "🏆", minDays: 30, maxDays: 59, color: "text-purple-500", description: "1 month of discipline" },
  { name: "Master", emoji: "🧘", minDays: 60, maxDays: 89, color: "text-primary", description: "Mind over impulse" },
  { name: "Legend", emoji: "🐉", minDays: 90, maxDays: 179, color: "text-gradient-fire", description: "90 days - Rewired!" },
  { name: "Immortal", emoji: "👑", minDays: 180, maxDays: Infinity, color: "text-gradient-legendary", description: "Complete transformation" },
];

export const MOTIVATIONAL_QUOTES = [
  "Every day you resist is a day you grow stronger.",
  "Your future self will thank you for the discipline you show today.",
  "The pain of discipline is far less than the pain of regret.",
  "You're not just breaking a habit, you're building a new you.",
  "Champions are made when no one is watching.",
  "The only way out is through. Keep going.",
  "Your streak is proof of your inner strength.",
  "One day at a time, one victory at a time.",
  "Discipline is choosing what you want most over what you want now.",
  "You are stronger than your urges.",
  "Every moment of resistance is a step toward freedom.",
  "The best time to start was yesterday. The next best time is now.",
];

export function getStreakData(): StreakData {
  const stored = localStorage.getItem('hydra_streak_data');
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    startDate: null,
    longestStreak: 0,
    totalRelapses: 0,
  };
}

export function saveStreakData(data: StreakData): void {
  localStorage.setItem('hydra_streak_data', JSON.stringify(data));
  window.dispatchEvent(new Event('hydra_streak_updated'));
}

export function calculateStreak(startDate: string | null): { days: number; hours: number; minutes: number } {
  if (!startDate) {
    return { days: 0, hours: 0, minutes: 0 };
  }

  const start = new Date(startDate);
  const now = new Date();
  const diff = now.getTime() - start.getTime();

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes };
}

export function getAvatarLevel(days: number): AvatarLevel {
  for (let i = AVATAR_LEVELS.length - 1; i >= 0; i--) {
    if (days >= AVATAR_LEVELS[i].minDays) {
      return AVATAR_LEVELS[i];
    }
  }
  return AVATAR_LEVELS[0];
}

export function getNextAvatarLevel(days: number): AvatarLevel | null {
  const currentIndex = AVATAR_LEVELS.findIndex(level => days >= level.minDays && days <= level.maxDays);
  if (currentIndex < AVATAR_LEVELS.length - 1) {
    return AVATAR_LEVELS[currentIndex + 1];
  }
  return null;
}

export function getRandomQuote(): string {
  return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
}

export function getDaysUntilNextLevel(days: number): number {
  const nextLevel = getNextAvatarLevel(days);
  if (!nextLevel) return 0;
  return nextLevel.minDays - days;
}

/**
 * Calculate consecutive days of check-ins from health history
 */
export function calculateConsecutiveCheckins(history: { timestamp: number }[]): number {
  if (!history || history.length === 0) return 0;

  // Sort by timestamp descending
  const sorted = [...history].sort((a, b) => b.timestamp - a.timestamp);

  // Get unique days (toDateString)
  const days = new Set<string>();
  sorted.forEach(h => days.add(new Date(h.timestamp).toDateString()));

  const uniqueDays = Array.from(days);
  if (uniqueDays.length === 0) return 0;

  let consecutive = 0;
  const today = new Date();
  const todayStr = today.toDateString();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  // If no check-in today or yesterday, consecutive is 0 (broken streak)
  if (uniqueDays[0] !== todayStr && uniqueDays[0] !== yesterdayStr) {
    return 0;
  }

  // Count backwards
  let lastDate = new Date(uniqueDays[0]);
  consecutive = 1;

  for (let i = 1; i < uniqueDays.length; i++) {
    const currentDate = new Date(uniqueDays[i]);
    const diffTime = Math.abs(lastDate.getTime() - currentDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      consecutive++;
      lastDate = currentDate;
    } else {
      break;
    }
  }

  return consecutive;
}

/**
 * Check if the user qualifies for the Aura bonus (5+ consecutive check-ins)
 */
export function hasAuraBonus(history: { timestamp: number }[]): boolean {
  return calculateConsecutiveCheckins(history) >= 5;
}
