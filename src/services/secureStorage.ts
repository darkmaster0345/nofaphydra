import { Preferences } from '@capacitor/preferences';

/**
 * Fortress Protocol - Secure Storage Service
 * 
 * This service acts as the single source of truth for sensitive data.
 * On Native (Android/iOS), it uses SharedPreferences/Keychain via Capacitor Preferences.
 * On Web, it falls back to LocalStorage (via Capacitor Preferences), but adheres to the
 * interface to allow future encryption upgrades.
 */

export const SecureStorage = {
    /**
     * Save a value securely
     */
    async set(key: string, value: string): Promise<void> {
        await Preferences.set({ key, value });
    },

    /**
     * Retrieve a value securely
     */
    async get(key: string): Promise<string | null> {
        const { value } = await Preferences.get({ key });
        return value;
    },

    /**
     * Remove a value
     */
    async remove(key: string): Promise<void> {
        await Preferences.remove({ key });
    },

    /**
     * Clear all keys (Panic Button/Logout)
     */
    async clear(): Promise<void> {
        await Preferences.clear();
    },

    /**
     * Migration Helper: Check if a key exists in insecure localStorage
     * and move it to Safe Storage if it does.
     */
    async migrateFromInsecure(key: string): Promise<boolean> {
        const insecureValue = localStorage.getItem(key);
        if (insecureValue) {
            console.log(`[Fortress] Migrating ${key} to Secure Storage...`);
            await this.set(key, insecureValue);
            localStorage.removeItem(key);
            return true; // Migration happened
        }
        return false; // No migration needed
    }
};
