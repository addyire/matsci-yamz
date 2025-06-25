"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { DefineTerm, DefineTermSchema } from "@/lib/schemas/terms";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";

export const DefineTermForm = () => {
  const router = useRouter();
  const form = useForm<DefineTerm>({
    resolver: zodResolver(DefineTermSchema),
    defaultValues: { term: "", examples: "", definition: "" },
  });

  const mutation = trpc.terms.create.useMutation({
    onSuccess: (term) => router.replace(`/terms/${term.id}`),
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="term"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Term</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="definition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Definition</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A _class_ of thing, followed by distinguishing characteristics, such as (for 'water'): 'A _clear liquid_ made up of hydrogen and oxygen molecules.'"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="examples"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Examples</FormLabel>
              <FormControl>
                <Input
                  placeholder="Examples of usage or related concepts"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={mutation.isPending} className="w-full">
          {mutation.isPending ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
};
