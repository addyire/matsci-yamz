import React from 'react';
import { trpc } from '../trpc';
import { useParams } from '@tanstack/router';

export default function TagDefinitions() {
  const { tagId } = useParams({ from: '/tags/$tagId' });
  const id = Number(tagId);
  const defsQuery = trpc.tags.definitions.useQuery({ tagId: id });

  if (defsQuery.isLoading) return <div>Loading...</div>;
  if (defsQuery.error) return <div>Error loading definitions</div>;

  return (
    <div>
      <h2>Definitions</h2>
      <ul>
        {defsQuery.data?.map((d) => (
          <li key={d.id}>
            <a href={`/definition/${d.id}`}>{d.term}: {d.definition}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
