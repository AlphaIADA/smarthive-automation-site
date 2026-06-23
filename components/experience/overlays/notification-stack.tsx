"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { EventBus } from "@/lib/experience/event-bus";
import type { ExperienceEventMap } from "@/types/experience";
import styles from "@/styles/experience/experience.module.css";

type ExperienceNotification = ExperienceEventMap["NOTIFICATION_PUSHED"];

export function NotificationStack({ eventBus }: { eventBus: EventBus }) {
  const [notifications, setNotifications] = useState<readonly ExperienceNotification[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const unsubscribe = eventBus.subscribe("NOTIFICATION_PUSHED", (notification) => {
      setNotifications((current) => [...current, notification].slice(-3));
      const timer = setTimeout(() => {
        setNotifications((current) => current.filter(({ id }) => id !== notification.id));
      }, 3600);
      timers.current.push(timer);
    });

    return () => {
      unsubscribe();
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [eventBus]);

  return (
    <div className="pointer-events-none absolute right-3 top-20 z-40 flex w-[min(22rem,calc(100vw-1.5rem))] flex-col gap-2 md:right-5">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div key={notification.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} className={`${styles.glass} rounded-2xl p-3 text-xs`}>
            {notification.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
