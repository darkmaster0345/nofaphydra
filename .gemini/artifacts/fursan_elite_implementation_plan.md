# Fursan Elite V2.5 - Implementation Plan

## Current Status Audit

### ✅ COMPLETED Features
| Feature | Status | Notes |
|---------|--------|-------|
| Bottom Navigation | ✅ Done | 3 tabs: Frontline, Vanguard, Archives |
| Vanguard Chat | ✅ Done | Clean encrypted chat with NIP-44 (silent) |
| Stormy Protocol Lock | ✅ Done | Full-screen lock with 5-second timer |
| Gold/Black Theme | ✅ Done | Applied to CSS variables and theme system |
| Settings Hub (Gear) | ✅ Done | Command Center with all technical settings |
| Sector Settings | ✅ Done | Manual Lat/Long coordinates available |
| Export Private Key | ✅ Done | In Data Fortress section |
| Wipe Data | ✅ Done | In Data Fortress section |
| Adhan Volume Toggle | ✅ Done | In Notification Protocol |
| 4-Day Recalibration | ✅ Done | Shows "System recalibrating" for days < 4 |

---

## 🔴 CRITICAL ISSUES TO FIX

### 1. UI Theme Consistency (HIGH PRIORITY)
**Problem:** Some components still use light backgrounds (white `bg-white`, cream colors)
**Files Affected:**
- `MindsetCheckin.tsx` - Uses white backgrounds on buttons
- `BiologicalCheckin.tsx` - Uses white backgrounds on buttons  
- `StreakCounter.tsx` - Uses cream gradients, amber-50 backgrounds
- `DailyHealthCheck.tsx` - Card styling inconsistent

**Fix Required:** Apply strict Gold (#FFD700) on Black (#000000) theme:
- All cards: 1px Gold Border + Black background
- Buttons: Solid gold text on black, or black text on gold for primary
- No grays, no cream, no white backgrounds

### 2. Dashboard Order (Frontline Index.tsx)
**Current Order:**
1. Header
2. Sync Indicator + Settings
3. StreakCounter
4. LocationTimeCard  
5. Mindset Check-in
6. Biological Check-in
7. Prayer Tracker
8. StreakActions

**Required Order per spec:**
1. Top Right: Gear Icon (Settings)
2. Top Center: Streak Counter (Large, Gold, Dominant)
3. Primary: Mindset Status Card
4. Secondary: Biological Signal Card  
5. Foundation: Prayer Tracker (5 Pillars)
6. Bottom: Hide stats (move to Archives)

**Status:** ⚠️ Order is close but needs minor adjustment (LocationTimeCard position)

### 3. Terminology Corrections
**Find & Replace:**
| Current | Replace With |
|---------|--------------|
| "Mental AQI" | "Mindset Status" |
| "Physical Amanah" | "Biological Signal" |
| "Morning Wood/NPT" | "Morning Signal" |
| "Bio-Mental Verification" | "Daily Protocol" |

**Status:** ✅ Most terms already correct

### 4. Icon Audit  
**Remove:** Brain/IQ icons, Gym weights  
**Use Only:** Shields, Lightning Bolts, Swords, Radio (for Vanguard)

**Current Icons:**
- `Sun` for Sharp ✅
- `CloudLightning` for Foggy/Stormy ✅
- `Shield` throughout ✅
- `Zap` for lightning ✅

### 5. Strict Color Palette
**Required Colors:**
- Background: `#000000` (Pure Black)
- Primary Accent: `#FFD700` (Elite Gold)
- Sharp/Yes: `#00FF00` (Pure Green)
- Foggy/Warning: `#FFA500` (Amber)
- Stormy/Danger: `#FF0000` (Pure Red)

**Current Issue:** Using Tailwind shades (amber-500, emerald-600) instead of exact hex values

---

## 📋 IMPLEMENTATION TASKS

### Phase 1: Theme Refinement (Priority 1)
- [ ] Task 1.1: Update `index.css` with exact hex color values
- [ ] Task 1.2: Update `MindsetCheckin.tsx` - Black backgrounds, gold borders
- [ ] Task 1.3: Update `BiologicalCheckin.tsx` - Black backgrounds, gold borders
- [ ] Task 1.4: Update `StreakCounter.tsx` - Remove cream, use pure black/gold
- [ ] Task 1.5: Update all card components for consistent styling

### Phase 2: Dashboard Restructure (Priority 2)
- [ ] Task 2.1: Reorder Index.tsx layout
- [ ] Task 2.2: Remove LocationTimeCard from main view (optional or move to Archives)
- [ ] Task 2.3: Ensure Mindset appears BEFORE Biological in the flow

### Phase 3: Typography & Icons (Priority 3)
- [ ] Task 3.1: Audit all icon usage
- [ ] Task 3.2: Ensure all headings are UPPERCASE, BOLD, WIDE SPACING
- [ ] Task 3.3: Body text: White (#FFFFFF), sans-serif

### Phase 4: Final Build (Priority 4)
- [ ] Task 4.1: Fix Gradle Java version issue (downgrade to Java 17 or upgrade Gradle)
- [ ] Task 4.2: Run `npm run build`
- [ ] Task 4.3: Run `npx cap sync android`
- [ ] Task 4.4: Build release APK
- [ ] Task 4.5: Generate F-Droid metadata

---

## Build Issue Details

**Error:** `Unsupported class file major version 69`
**Cause:** Java 25 is too new for Gradle 8.5
**Solution Options:**
1. Downgrade JAVA_HOME to Java 17
2. Upgrade Gradle wrapper to 9.0+
3. Use `--java-home` flag to specify Java 17 path

---

## Files to Modify

| File | Changes Required |
|------|------------------|
| `src/index.css` | Update :root with exact colors |
| `src/data/themes.ts` | Ensure Fursan Elite uses correct values |
| `src/components/MindsetCheckin.tsx` | Black/Gold styling |
| `src/components/BiologicalCheckin.tsx` | Black/Gold styling |
| `src/components/StreakCounter.tsx` | Black/Gold styling |
| `src/components/DailyHealthCheck.tsx` | Black/Gold styling |
| `src/pages/Index.tsx` | Layout reorder |
| `android/gradle.properties` | Java version fix |

---

## Acceptance Criteria

1. ✅ All screens use pure black (#000000) background
2. ✅ All accents use elite gold (#FFD700)  
3. ✅ Status colors are green/amber/red (pure values)
4. ✅ Bottom nav has 3 tabs working correctly
5. ✅ Vanguard chat encrypts silently (no NIP-44 popups)
6. ✅ Stormy state triggers 5-second locked overlay
7. ✅ Settings Hub contains all technical config
8. ✅ APK builds successfully
