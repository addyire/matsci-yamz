import { DefineTermForm } from "@/components/definition/form";

export const AddDefinitionForm = () => {
  const mutation = trpc.terms.create.useMutation({
    onSuccess: (term) => router.replace(`/terms/${term.id}`),
  });

  return <DefineTermForm />;
};
