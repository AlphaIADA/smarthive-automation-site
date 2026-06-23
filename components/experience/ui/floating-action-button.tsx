"use client";

import { motion } from "framer-motion";
import type { EventBus } from "@/lib/experience/event-bus";
import styles from "@/styles/experience/experience.module.css";
import { CameraIcon } from "./icons";

export function FloatingActionButton({ eventBus }: { eventBus: EventBus }) {
  return (
    <motion.button
      type="button"
      aria-label="Reset camera"
      title="Reset camera"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => eventBus.emit("CAMERA_CHANGED", { preset: "default" })}
      className={`${styles.glass} absolute bottom-3 right-3 z-30 grid size-10 place-items-center rounded-2xl text-inherit md:right-5`}
    >
      <CameraIcon />
    </motion.button>
  );
}
