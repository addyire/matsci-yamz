import React, { useState } from 'react';
import { trpc } from '../trpc';
import { useNavigate } from '@tanstack/router';

export default function AddTerm() {
  const navigate = useNavigate({ from: '/add' });
  const mutation = trpc.terms.create.useMutation({
    onSuccess: (data) => {
      navigate({ to: `/terms/${data.term.id}` });
    },
  });

  const [term, setTerm] = useState('');
  const [definition, setDefinition] = useState('');
  const [examples, setExamples] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ term, definition, examples });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Term</label>
        <input value={term} onChange={(e) => setTerm(e.target.value)} />
      </div>
      <div>
        <label>Definition</label>
        <textarea
          value={definition}
          onChange={(e) => setDefinition(e.target.value)}
        />
      </div>
      <div>
        <label>Examples</label>
        <input
          value={examples}
          onChange={(e) => setExamples(e.target.value)}
        />
      </div>
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
