import React, { useState } from 'react';
import { trpc } from '../trpc';

export default function Tags() {
  const tagsQuery = trpc.tags.getAll.useQuery();
  const utils = trpc.useUtils();
  const [name, setName] = useState('');

  const createMutation = trpc.tags.create.useMutation({
    onSuccess: () => {
      utils.tags.getAll.invalidate();
      setName('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ name });
  };

  if (tagsQuery.isLoading) return <div>Loading...</div>;
  if (tagsQuery.error) return <div>Error loading tags</div>;

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        <button type="submit" disabled={createMutation.isPending}>Add</button>
      </form>
      <ul>
        {tagsQuery.data?.map((t) => (
          <li key={t.id}>
            <a href={`/tags/${t.id}`}>{t.name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
