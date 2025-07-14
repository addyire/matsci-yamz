"use client";
import { trpc } from "@/trpc/client";

export const Chats = ({ termId }: { termId: number }) => {
  const { data: chats } = trpc.admin.chats.useQuery(termId, {
    initialData: [],
  });

  return (
    <section className="flex flex-col">
      {chats.map((chat) => (
        <div
          style={{
            alignSelf: chat.role === "system" ? "self-start" : "self-end",
          }}
          key={chat.id}
        >
          <p>{chat.role}</p>
          <div className="p-2 bg-secondary min-w-64 w-min rounded-md">
            <pre>{chat.message}</pre>
          </div>
        </div>
      ))}
    </section>
  );
};
