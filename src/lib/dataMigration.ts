/**
 * Data Migration Utility
 * 
 * Migrates data from old 'hydra_*' localStorage keys to new 'fursan_*' keys.
 * Runs once on app start and sets a flag to prevent re-running.
 */

const MIGRATION_FLAG = 'fursan_migration_v1_complete';

interface MigrationMapping {
    oldKey: string;
    newKey: string;
}

const KEY_MAPPINGS: MigrationMapping[] = [
    { oldKey: 'hydra_streak_data', newKey: 'fursan_streak_data' },
    { oldKey: 'hydra_activity_log', newKey: 'fursan_activity_log' },
    { oldKey: 'hydra_chat_rules_seen', newKey: 'fursan_chat_rules_seen' },
];

/**
 * Check if migration has already been completed
 */
export function isMigrationComplete(): boolean {
    return localStorage.getItem(MIGRATION_FLAG) === 'true';
}

/**
 * Perform the data migration from hydra_* to fursan_* keys
 * 
 * - Does not overwrite existing fursan_* data
 * - Preserves old hydra_* data as backup
 * - Sets migration flag when complete
 */
export function migrateData(): { migrated: number; skipped: number } {
    if (isMigrationComplete()) {
        return { migrated: 0, skipped: 0 };
    }

    let migrated = 0;
    let skipped = 0;

    for (const mapping of KEY_MAPPINGS) {
        const oldData = localStorage.getItem(mapping.oldKey);
        const newData = localStorage.getItem(mapping.newKey);

        // Only migrate if old data exists and new data doesn't
        if (oldData && !newData) {
            try {
                localStorage.setItem(mapping.newKey, oldData);
                migrated++;
                console.log(`[FURSAN-MIGRATION] Migrated: ${mapping.oldKey} → ${mapping.newKey}`);
            } catch (e) {
                console.error(`[FURSAN-MIGRATION] Failed to migrate ${mapping.oldKey}:`, e);
            }
        } else if (newData) {
            skipped++;
            console.log(`[FURSAN-MIGRATION] Skipped (already exists): ${mapping.newKey}`);
        }
    }

    // Mark migration as complete
    localStorage.setItem(MIGRATION_FLAG, 'true');
    console.log(`[FURSAN-MIGRATION] Complete. Migrated: ${migrated}, Skipped: ${skipped}`);

    return { migrated, skipped };
}

/**
 * Run migration on app startup
 * Call this from main.tsx or App.tsx
 */
export function runMigrationIfNeeded(): void {
    if (!isMigrationComplete()) {
        const result = migrateData();
        if (result.migrated > 0) {
            // Dispatch event to notify other components of data update
            window.dispatchEvent(new Event('fursan_streak_updated'));
        }
    }
}
