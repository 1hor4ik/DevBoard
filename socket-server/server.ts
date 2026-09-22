import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

type TypingEntry = {
  userId: string;
  name: string;
  timer: ReturnType<typeof setTimeout>;
};
const typingRooms = new Map<string, Map<string, TypingEntry>>();

function publishTyping(taskId: string) {
  const users = Array.from(
    typingRooms.get(taskId) ?? [],
    ([socketId, entry]) => ({
      socketId,
      userId: entry.userId,
      name: entry.name,
    }),
  );
  io.to(taskId).emit("taskTyping", { taskId, users });
}

function stopTyping(taskId: string, socketId: string) {
  const room = typingRooms.get(taskId);
  const entry = room?.get(socketId);
  if (!room || !entry) return;
  clearTimeout(entry.timer);
  room.delete(socketId);
  if (!room.size) typingRooms.delete(taskId);
  publishTyping(taskId);
}

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("joinTaskRoom", (taskId) => {
    socket.join(taskId);
    publishTyping(taskId);
    console.log(`Client ${socket.id} joined room for task ${taskId}`);
  });

  socket.on("leaveTaskRoom", (taskId) => {
    stopTyping(taskId, socket.id);
    socket.leave(taskId);
    console.log(`Client ${socket.id} left room for task ${taskId}`);
  });

  socket.on("newComment", (taskId, comment) => {
    stopTyping(taskId, socket.id);
    console.log(`New comment on task ${taskId}:`, comment);
    socket.to(taskId).emit("newComment", comment);
  });

  socket.on("typing", (taskId) => {
    socket.to(taskId).emit("typing", { userId: socket.id });
  });

  socket.on("disconnect", () => {
    for (const taskId of typingRooms.keys()) stopTyping(taskId, socket.id);
    console.log("Client disconnected:", socket.id);
  });

  socket.on("joinProjectRoom", (projectId: string) => {
    if (typeof projectId === "string" && projectId) {
      socket.join(`project:${projectId}`);
    }
  });

  socket.on("taskTypingStart", (payload) => {
    if (
      !payload ||
      typeof payload.taskId !== "string" ||
      typeof payload.userId !== "string" ||
      typeof payload.name !== "string" ||
      !socket.rooms.has(payload.taskId)
    )
      return;
    const { taskId, userId } = payload;
    const room = typingRooms.get(taskId) ?? new Map<string, TypingEntry>();
    const previous = room.get(socket.id);
    if (previous) clearTimeout(previous.timer);
    room.set(socket.id, {
      userId,
      name: payload.name.trim().slice(0, 80) || "Someone",
      timer: setTimeout(() => stopTyping(taskId, socket.id), 2500),
    });
    typingRooms.set(taskId, room);
    publishTyping(taskId);
  });

  socket.on("taskTypingStop", (taskId) => {
    if (typeof taskId === "string") stopTyping(taskId, socket.id);
  });

  socket.on("leaveProjectRoom", (projectId: string) => {
    socket.leave(`project:${projectId}`);
  });

  for (const event of [
    "taskCreated",
    "taskStatusUpdated",
    "taskDeleted",
    "taskEdited",
  ]) {
    socket.on(event, (payload) => {
      if (!payload || typeof payload.projectId !== "string") return;
      const room = `project:${payload.projectId}`;
      if (!socket.rooms.has(room)) return;
      io.to(room).emit(event, payload);
    });
  }
});

httpServer.listen(3001, () => {
  console.log("Socket server running on port 3001");
});
