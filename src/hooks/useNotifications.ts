import { useState, useEffect, useCallback } from "react";
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { MOTIVATIONAL_MESSAGES, getFormattedMotivation } from "@/data/motivation";
import { getPrayerNotificationTimes } from "@/lib/prayerUtils";

const STORAGE_KEY = "fursan_notifications_enabled";
const INTERVAL_STORAGE_KEY = "fursan_notification_interval_hours";
const DEFAULT_INTERVAL_HOURS = 3;

export function useNotifications() {
  const [permission, setPermission] = useState<string>("default");
  const [enabled, setEnabled] = useState(false);
  const [intervalHours, setIntervalHoursState] = useState<number>(DEFAULT_INTERVAL_HOURS);

  const checkPermission = useCallback(async () => {
    if (Capacitor.isNativePlatform()) {
      const status = await LocalNotifications.checkPermissions();
      setPermission(status.display);
    } else if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    checkPermission();
    const stored = localStorage.getItem(STORAGE_KEY);
    setEnabled(stored === "true");

    const storedInterval = localStorage.getItem(INTERVAL_STORAGE_KEY);
    if (storedInterval) {
      setIntervalHoursState(parseInt(storedInterval));
    }
  }, [checkPermission]);

  const scheduleNotifications = useCallback(async () => {
    if (!Capacitor.isNativePlatform() && !("Notification" in window)) return;

    try {
      // 1. Clear all existing pending notifications to avoid duplicates
      if (Capacitor.isNativePlatform()) {
        const pending = await LocalNotifications.getPending();
        if (pending.notifications.length > 0) {
          await LocalNotifications.cancel(pending);
        }
      }

      const notifications = [];
      let notificationId = 1;

      // 2. Schedule Adhan (Prayer Time) Notifications
      const prayerTimes = await getPrayerNotificationTimes();
      prayerTimes.forEach(p => {
        notifications.push({
          title: `Adhan: ${p.name} 🕌`,
          body: `It is time for ${p.name}. Rise, ya Faris, for the success is in Salah.`,
          id: notificationId++,
          schedule: { at: p.time },
          smallIcon: "res://ic_stat_icon",
          sound: "adhan.wav", // Native apps can play a custom adhan sound if provided
        });
      });

      // 3. Schedule periodic motivational signals
      const intervalMs = intervalHours * 60 * 60 * 1000;
      for (let i = 1; i <= 10; i++) {
        notifications.push({
          title: "Fursan Shield ⚔️",
          body: MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)],
          id: notificationId++,
          schedule: { at: new Date(Date.now() + (intervalMs * i)) },
          smallIcon: "res://ic_stat_icon",
        });
      }

      if (Capacitor.isNativePlatform()) {
        await LocalNotifications.schedule({ notifications });
      } else {
        console.log("[FURSAN] Web notifications scheduled (SIMULATED):", notifications);
      }

      console.log(`[FURSAN] scheduled ${notifications.length} protocol signals (Interval: ${intervalHours}h).`);
    } catch (err) {
      console.error("Failed to schedule notifications", err);
    }
  }, [intervalHours]);

  const setIntervalHours = async (hours: number) => {
    setIntervalHoursState(hours);
    localStorage.setItem(INTERVAL_STORAGE_KEY, hours.toString());
    if (enabled && (permission === "granted" || permission === "provisional")) {
      await scheduleNotifications();
    }
  };

  const showTestNotification = useCallback(async () => {
    const quote = getFormattedMotivation();

    if (Capacitor.isNativePlatform()) {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: "Fursan Shield Active ⚔️",
            body: quote,
            id: 999,
            schedule: { at: new Date(Date.now() + 1000) },
          }
        ]
      });
    } else if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Fursan Shield Active ⚔️", { body: quote });
    }
  }, []);

  const requestPermission = async () => {
    if (Capacitor.isNativePlatform()) {
      const result = await LocalNotifications.requestPermissions();
      setPermission(result.display);

      if (result.display === "granted") {
        setEnabled(true);
        localStorage.setItem(STORAGE_KEY, "true");
        await scheduleNotifications();
        await showTestNotification();
        return true;
      }
    } else if ("Notification" in window) {
      const result = await Notification.permission;
      if (result === "default") {
        const webResult = await Notification.requestPermission();
        setPermission(webResult);
        if (webResult === "granted") {
          setEnabled(true);
          localStorage.setItem(STORAGE_KEY, "true");
          await showTestNotification();
          return true;
        }
      } else {
        setPermission(result);
        if (result === "granted") {
          setEnabled(true);
          localStorage.setItem(STORAGE_KEY, "true");
          await showTestNotification();
          return true;
        }
      }
    }
    return false;
  };

  const toggleNotifications = async () => {
    if (!enabled) {
      const success = await requestPermission();
      return success;
    } else {
      setEnabled(false);
      localStorage.setItem(STORAGE_KEY, "false");
      if (Capacitor.isNativePlatform()) {
        const pending = await LocalNotifications.getPending();
        if (pending.notifications.length > 0) {
          await LocalNotifications.cancel(pending);
        }
      }
      return false;
    }
  };

  // Reschedule whenever the app is opened to keep the window moving forward
  useEffect(() => {
    if (enabled && (permission === "granted" || permission === "provisional")) {
      scheduleNotifications();
    }
  }, [enabled, permission, scheduleNotifications]);

  return {
    permission,
    enabled,
    intervalHours,
    setIntervalHours,
    toggleNotifications,
    isSupported: Capacitor.isNativePlatform() || "Notification" in window,
  };
}
