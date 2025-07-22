"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useForm } from "react-hook-form";
import { Textarea } from "../ui/textarea";
import { trpc } from "@/trpc/client";
import { useState } from "react";

type EditTerm = z.infer<typeof EditTermSchema>;
const EditTermSchema = z.object({
  definition: z.string(),
  example: z.string(),
});

interface Props {
  defaultValues: {
    example: string;
    definition: string;
  };
  definitionId: number;
}

export const EditDefinitionDialog = ({
  defaultValues,
  definitionId,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<EditTerm>({
    resolver: zodResolver(EditTermSchema),
    defaultValues,
  });

  const mutation = trpc.definitions.edit.useMutation({
    onSuccess: () => {
      setIsOpen(false);
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Definition</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => {
              console.log(data);
              mutation.mutate({ id: definitionId, ...data });
            }, console.log)}
            className="space-y-4"
          >
            <DialogTitle hidden />
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
              name="example"
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
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="flex-1"
              >
                {mutation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
