import React from 'react';
import { trpc } from '../trpc';
import { useParams } from '@tanstack/router';

export default function TermDefinitions() {
  const { termId } = useParams({ from: '/terms/$termId' });
  const id = Number(termId);
  const termQuery = trpc.terms.get.useQuery({ termId: id });
  const defsQuery = trpc.definitions.list.useQuery({ termId: id });

  if (termQuery.isLoading || defsQuery.isLoading) return <div>Loading...</div>;
  if (termQuery.error || defsQuery.error) return <div>Error loading data</div>;

  return (
    <div>
      <h2>Definitions for {termQuery.data?.term}</h2>
      <ul>
        {defsQuery.data?.map((d) => (
          <li key={d.id}>
            <a href={`/definition/${d.id}`}>{d.definition}</a>
            {' '}({d.score})
          </li>
        ))}
      </ul>
    </div>
  );
}
