"use client";

import { useState } from "react";
import { useKey } from "react-use";
import type { EventBus } from "@/lib/experience/event-bus";

export function useDebugShortcut(eventBus: EventBus): boolean {
  const [visible, setVisible] = useState(false);

  useKey(
    (event) => event.shiftKey && event.key.toLowerCase() === "d",
    (event) => {
      event.preventDefault();
      setVisible((current) => {
        const next = !current;
        eventBus.emit("DEBUG_TOGGLE", { visible: next });
        return next;
      });
    },
  );

  return visible;
}
