"use client";

import type { TaskTypingPresence } from "@/types/socket";

import { useCallback, useEffect, useRef, useState } from "react";
import { socket } from "@/lib/socket-client/socket";

export function useTaskTyping(
  taskId: string,
  open: boolean,
  user?: { id: string; name?: string | null },
) {
  const [presence, setPresence] = useState<TaskTypingPresence>({
    taskId,
    users: [],
  });
  const lastSent = useRef(0);

  const stopTyping = useCallback(() => {
    lastSent.current = 0;
    if (socket.connected) socket.emit("taskTypingStop", taskId);
  }, [taskId]);

  useEffect(() => {
    if (!open) return;
    const onTyping = (payload: TaskTypingPresence) => {
      if (payload.taskId === taskId) setPresence(payload);
    };
    const clear = () => setPresence({ taskId, users: [] });
    socket.on("taskTyping", onTyping);
    socket.on("disconnect", clear);
    return () => {
      stopTyping();
      socket.off("taskTyping", onTyping);
      socket.off("disconnect", clear);
    };
  }, [open, taskId, stopTyping]);

  const notifyTyping = (value: string) => {
    if (!value.trim()) {
      stopTyping();
      return;
    }
    if (!open || !user || !socket.connected) return;
    const now = Date.now();
    if (now - lastSent.current < 800) return;
    lastSent.current = now;
    socket.emit("taskTypingStart", {
      taskId,
      userId: user.id,
      name: user.name || "Someone",
    });
  };

  const others =
    open && presence.taskId === taskId
      ? presence.users.filter((entry) => entry.userId !== user?.id)
      : [];
  const users = Array.from(
    new Map(others.map((entry) => [entry.userId, entry])).values(),
  );
  return { users, notifyTyping, stopTyping };
}
