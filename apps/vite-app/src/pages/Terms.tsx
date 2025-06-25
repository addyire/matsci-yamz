import React from 'react';
import { trpc } from '../trpc';

export default function Terms() {
  const termsQuery = trpc.terms.list.useQuery(undefined, {
    staleTime: 30000,
  });

  if (termsQuery.isLoading) return <div>Loading...</div>;
  if (termsQuery.error) return <div>Error loading terms</div>;

  return (
    <ul>
      {termsQuery.data?.map((t) => (
        <li key={t.id}>
          <a href={`/terms/${t.id}`}>{t.term} ({t.count})</a>
        </li>
      ))}
    </ul>
  );
}
