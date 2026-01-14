import { useState, useEffect, useCallback, useRef } from "react";

const NOTIFICATION_INTERVAL = 3 * 60 * 60 * 1000; // 3 hours in ms
const STORAGE_KEY = "hydra_notifications_enabled";
const LAST_NOTIFICATION_KEY = "hydra_last_notification";

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [enabled, setEnabled] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    setEnabled(stored === "true");
  }, []);

  const fetchMotivation = async (): Promise<string> => {
    const quotes = [
      "Stay strong. Every moment of resistance builds your strength.",
      "Your discipline today shapes your freedom tomorrow.",
      "The only easy day was yesterday.",
      "Conquer yourself, conquer the world.",
      "Pain is temporary. Glory is forever."
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  const showNotification = useCallback(async () => {
    if (Notification.permission !== "granted") return;

    const quote = await fetchMotivation();

    const notification = new Notification("NoFap Hydra 🐉", {
      body: quote,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: "hydra-motivation",
      requireInteraction: false,
    });

    localStorage.setItem(LAST_NOTIFICATION_KEY, Date.now().toString());

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }, []);

  const scheduleNotifications = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Check if we should show notification immediately (3hrs since last)
    const lastNotification = localStorage.getItem(LAST_NOTIFICATION_KEY);
    if (lastNotification) {
      const elapsed = Date.now() - parseInt(lastNotification);
      if (elapsed >= NOTIFICATION_INTERVAL) {
        showNotification();
      }
    }

    intervalRef.current = setInterval(() => {
      showNotification();
    }, NOTIFICATION_INTERVAL);
  }, [showNotification]);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === "granted") {
      setEnabled(true);
      localStorage.setItem(STORAGE_KEY, "true");
      scheduleNotifications();
      // Show a test notification
      showNotification();
      return true;
    }
    return false;
  };

  const toggleNotifications = async () => {
    if (!enabled) {
      const granted = await requestPermission();
      return granted;
    } else {
      setEnabled(false);
      localStorage.setItem(STORAGE_KEY, "false");
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return false;
    }
  };

  // Start notifications if enabled
  useEffect(() => {
    if (enabled && permission === "granted") {
      scheduleNotifications();
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, permission, scheduleNotifications]);

  return {
    permission,
    enabled,
    toggleNotifications,
    isSupported: "Notification" in window,
  };
}
