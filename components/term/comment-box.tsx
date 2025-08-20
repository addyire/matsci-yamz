"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "../ui/textarea";
import { trpc } from "@/trpc/client";
import Link from "next/link";
import { toast } from "sonner";

const commentSchema = z.object({
  message: z.string().nonempty({ message: "Comment cannot be empty" }),
});

export function TermCommentBox({ id }: { id: number }) {
  const utils = trpc.useUtils();

  // 1. Define your form.
  const form = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      message: "",
    },
  });

  const { mutate } = trpc.comments.create.useMutation({
    onSettled: () => {
      form.reset();

      utils.comments.get.refetch(id);
    },
    onError: () => toast("You must be logged in to comment!", {
      action: <Link href="/api/login" className="ml-auto"><Button>Login</Button></Link>,
      position: 'top-center'
    })
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) =>
          mutate({ id, comment: data.message }),
        )}
        className="space-y-2"
      >
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea placeholder="Add comment" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Comment</Button>
      </form>
    </Form>
  );
}
