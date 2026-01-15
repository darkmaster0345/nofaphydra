import { useState, useEffect, useCallback } from "react";
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

const STORAGE_KEY = "hydra_notifications_enabled";

export function useNotifications() {
  const [permission, setPermission] = useState<string>("default");
  const [enabled, setEnabled] = useState(false);

  // Check current permission status
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

  const fetchMotivation = async (): Promise<string> => {
    const quotes = [
      "Stay strong. Every moment of resistance builds your strength.",
      "Your discipline today shapes your freedom tomorrow.",
      "The only easy day was yesterday.",
      "Conquer yourself, conquer the world.",
      "Pain is temporary. Glory is forever.",
      "Hydra protocol: Persistence is mandatory.",
      "Discipline is the bridge between goals and accomplishment.",
      "Suffer the pain of discipline or suffer the pain of regret."
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  const scheduleNotifications = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      console.log("Local notifications only supported on native platforms.");
      return;
    }

    try {
      // Clear pending
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel(pending);
      }

      // Schedule 3 notifications for the next 9 hours (every 3 hours)
      const quote1 = await fetchMotivation();
      const quote2 = await fetchMotivation();
      const quote3 = await fetchMotivation();

      await LocalNotifications.schedule({
        notifications: [
          {
            title: "NoFap Hydra 🐉",
            body: quote1,
            id: 1,
            schedule: { at: new Date(Date.now() + 1000 * 60 * 60 * 3) }, // 3 hours
            sound: undefined,
            attachments: undefined,
            actionTypeId: "",
            extra: null
          },
          {
            title: "NoFap Hydra 🐉",
            body: quote2,
            id: 2,
            schedule: { at: new Date(Date.now() + 1000 * 60 * 60 * 6) }, // 6 hours
            sound: undefined,
            attachments: undefined,
            actionTypeId: "",
            extra: null
          },
          {
            title: "NoFap Hydra 🐉",
            body: quote3,
            id: 3,
            schedule: { at: new Date(Date.now() + 1000 * 60 * 60 * 9) }, // 9 hours
            sound: undefined,
            attachments: undefined,
            actionTypeId: "",
            extra: null
          }
        ]
      });
      console.log("Notifications scheduled successfully");
    } catch (err) {
      console.error("Failed to schedule notifications", err);
    }
  }, []);

  const showTestNotification = useCallback(async () => {
    const quote = await fetchMotivation();

    if (Capacitor.isNativePlatform()) {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: "Hydra Shield Active 🐉",
            body: quote,
            id: 99,
            schedule: { at: new Date(Date.now() + 1000) }, // 1 sec later
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

  return {
    permission,
    enabled,
    toggleNotifications,
    isSupported: Capacitor.isNativePlatform() || "Notification" in window,
  };
}
