import { useState, useEffect, useCallback } from "react";
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { MOTIVATIONAL_MESSAGES, getRandomMotivation } from "@/data/motivation";

const STORAGE_KEY = "hydra_notifications_enabled";
const NOTIFICATION_INTERVAL_MS = 3 * 60 * 60 * 1000; // 3 hours

export function useNotifications() {
  const [permission, setPermission] = useState<string>("default");
  const [enabled, setEnabled] = useState(false);

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
  }, [checkPermission]);

  const scheduleNotifications = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      // 1. Clear all existing pending notifications to avoid duplicates
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel(pending);
      }

      // 2. Schedule a batch for the next 48 hours (16 notifications at 3h intervals)
      // This ensures the user gets notifications even if they don't open the app for 2 days.
      const notifications = [];
      for (let i = 1; i <= 16; i++) {
        notifications.push({
          title: "NoFap Hydra 🐉",
          body: MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)],
          id: i,
          schedule: { at: new Date(Date.now() + (NOTIFICATION_INTERVAL_MS * i)) },
          smallIcon: "res://ic_stat_icon", // Fallback to system icon for status bar
          actionTypeId: "",
          extra: null
        });
      }

      await LocalNotifications.schedule({ notifications });
      console.log(`[HYDRA] scheduled ${notifications.length} periodic signals.`);
    } catch (err) {
      console.error("Failed to schedule notifications", err);
    }
  }, []);

  const showTestNotification = useCallback(async () => {
    const quote = getRandomMotivation();

    if (Capacitor.isNativePlatform()) {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: "Hydra Shield Active 🐉",
            body: quote,
            id: 99,
            schedule: { at: new Date(Date.now() + 1000) },
          }
        ]
      });
    } else if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Hydra Shield Active 🐉", { body: quote });
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
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "granted") {
        setEnabled(true);
        localStorage.setItem(STORAGE_KEY, "true");
        await showTestNotification();
        return true;
      }
    }
    return false;
  };

  const toggleNotifications = async () => {
    if (!enabled) {
      return await requestPermission();
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

  // Reschedule whenever the app is opened to keep the 48h window moving forward
  useEffect(() => {
    if (enabled && permission === "granted") {
      scheduleNotifications();
    }
  }, [enabled, permission, scheduleNotifications]);

  return {
    permission,
    enabled,
    toggleNotifications,
    isSupported: Capacitor.isNativePlatform() || "Notification" in window,
  };
}
