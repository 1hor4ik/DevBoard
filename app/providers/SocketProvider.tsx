"use client";

import { useEffect } from "react";
import { socket } from "@/lib/socket-client/socket";

export default function SocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  return children;
}
