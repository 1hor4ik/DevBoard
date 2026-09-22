"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  CalendarDays,
  MessageSquare,
  SendHorizontal,
  Smile,
} from "lucide-react";

import { TaskPriority, TaskStatus } from "@/generated/prisma/browser";
import { createComment } from "@/server/actions/comment-actions";

import { Dialog, DialogContent } from "@/components/ui/dialog";

import EmojiPicker from "emoji-picker-react";
import BeatLoader from "react-spinners/BeatLoader";
import { authClient } from "@/lib/auth-client";
import { useTaskTyping } from "./use-task-typing";

import { socket } from "@/lib/socket-client/socket";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | string | null;
  createdAt: Date | string;
  assignee: {
    id: string;
    name: string;
    email: string;
  } | null;
  comments: {
    id: string;
    content: string;
    createdAt: Date | string;

    author: {
      id: string;
      name: string | null;
      image?: string | null;
      email: string;
    };
  }[];
};

type CommentsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceSlug: string;
  projectId: string;
  task: Task;
};

export function CommentsDialog({
  open,
  onOpenChange,
  task,
}: CommentsDialogProps) {
  const [comment, setComment] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [comments, setComments] = useState(task.comments);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const { data: session } = authClient.useSession();
  const {
    users: typingUsers,
    notifyTyping,
    stopTyping,
  } = useTaskTyping(task.id, open, session?.user);
  const typingLabel =
    typingUsers.length === 1
      ? `${typingUsers[0].name} is typing`
      : typingUsers.length === 2
        ? `${typingUsers[0].name} and ${typingUsers[1].name} are typing`
        : `${typingUsers[0]?.name} and ${typingUsers.length - 1} others are typing`;

  useEffect(() => {
    if (!open) return;
    const onComment = (comment: Task["comments"][number]) => {
      setComments((prevComments) => [...prevComments, comment]);
    };
    socket.on("newComment", onComment);

    return () => {
      socket.off("newComment", onComment);
    };
  }, [open, task.id]);

  useEffect(() => {
    if (!open) return;

    const join = () => {
      socket.emit("joinTaskRoom", task.id);
    };
    socket.on("connect", join);
    if (socket.connected) join();

    return () => {
      socket.off("connect", join);
      if (socket.connected) socket.emit("leaveTaskRoom", task.id);
    };
  }, [open, task.id]);

  async function handleComment() {
    try {
      if (!comment.trim()) return;
      stopTyping();

      const newComment = await createComment({
        content: comment,
        taskId: task.id,
      });

      setComments((prevComments) => [...prevComments, newComment]);

      socket.emit("newComment", task.id, newComment);

      setComment("");

      toast.success("Comment added successfully!");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment. Please try again.");
    }
  }

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (!open) return;

    setTimeout(() => {
      scrollToBottom();
    }, 0);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[85vh] max-w-3xl flex-col overflow-hidden rounded-3xl p-0 bg-white">
        <div className="border-b bg-white px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <MessageSquare className="h-6 w-6" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900">Comments</h2>

              <p className="text-sm text-slate-500">
                Discuss this task with your team.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm mt-6">
            <h3 className="text-xl font-semibold text-slate-900">
              {task.title}
            </h3>

            {task.description && (
              <p className="mt-3 leading-7 text-slate-500">
                {task.description}
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
                {task.priority}
              </span>

              {task.assignee && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                  {task.assignee.name}
                </span>
              )}

              {task.dueDate && (
                <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                  <CalendarDays className="h-4 w-4" />
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white">
          <div className="space-y-6 p-6">
            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="flex h-full items-center justify-center py-20">
                  <div className="text-center">
                    <MessageSquare className="mx-auto mb-4 h-10 w-10 text-slate-300" />

                    <h3 className="font-semibold text-slate-700">
                      No comments yet
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Start the discussion by writing the first comment.
                    </p>
                  </div>
                </div>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex gap-4">
                      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100 font-semibold text-amber-700 overflow-hidden">
                        {comment.author?.image ? (
                          <Image
                            src={comment.author.image}
                            alt={comment.author.name || "User Avatar"}
                            fill
                            className="object-cover rounded-full"
                          />
                        ) : (
                          <span>{getInitials(comment.author?.name)}</span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-slate-900">
                            {comment.author?.name || comment.author?.email}
                          </h4>

                          <span className="text-xs text-slate-400">
                            {formatCommentDate(comment.createdAt)}
                          </span>
                        </div>

                        <p className="mt-3 leading-7 text-slate-600">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={commentsEndRef} />
            </div>
          </div>
        </div>

        <div className="border-t bg-white p-6">
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="mb-2 flex h-6 items-center gap-2 text-xs text-slate-500"
          >
            {typingUsers.length > 0 && (
              <>
                <span
                  aria-hidden="true"
                  className="inline-flex rounded-full bg-amber-50 px-2 py-1 motion-reduce:**:animate-none!"
                >
                  <BeatLoader
                    size={5}
                    margin={2}
                    color="#d97706"
                    speedMultiplier={0.8}
                  />
                </span>
                <span className="truncate">{typingLabel}</span>
              </>
            )}
          </div>
          {showEmojiPicker && (
            <div className="absolute bottom-50 left-5 z-50">
              <EmojiPicker
                onEmojiClick={(emoji) => {
                  const value = comment + emoji.emoji;
                  setComment(value);
                  notifyTyping(value);
                }}
              />
            </div>
          )}

          <Textarea
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              notifyTyping(e.target.value);
            }}
            onBlur={stopTyping}
            className="min-h-27.5 resize-none rounded-2xl"
          />

          <div className="mt-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className={`cursor-pointer rounded-xl transition-colors
    ${
      showEmojiPicker
        ? "bg-amber-400! hover:bg-amber-400!"
        : "bg-slate-100 hover:bg-slate-200"
    }`}
            >
              <Smile className="h-5 w-5" />
            </Button>

            <Button
              onClick={handleComment}
              size="icon"
              disabled={!comment.trim()}
              className="cursor-pointer rounded-xl bg-amber-400 text-slate-900 hover:bg-amber-500 disabled:bg-slate-200 disabled:text-slate-400"
            >
              <SendHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatCommentDate(date: Date | string | null | undefined) {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
}
function getInitials(name?: string | null) {
  if (!name) return "?";

  return name
    .trim()
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
