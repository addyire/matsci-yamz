import React, { useState } from 'react';
import { trpc } from '../trpc';
import { useParams } from '@tanstack/router';

export default function Definition() {
  const { definitionId } = useParams({ from: '/definition/$definitionId' });
  const id = Number(definitionId);
  const defQuery = trpc.definitions.get.useQuery({ definitionId: id });
  const commentsQuery = trpc.comments.get.useQuery(id);
  const tagsQuery = trpc.tags.get.useQuery({ definitionId: id });
  const utils = trpc.useUtils();

  const voteMutation = trpc.votes.vote.useMutation({
    onSuccess: () => {
      utils.definitions.get.invalidate({ definitionId: id });
      utils.definitions.list.invalidate();
    },
  });

  const commentMutation = trpc.comments.create.useMutation({
    onSuccess: () => {
      utils.comments.get.invalidate(id);
      setComment('');
    },
  });

  const [comment, setComment] = useState('');

  if (defQuery.isLoading) return <div>Loading...</div>;
  if (defQuery.error) return <div>Error loading definition</div>;

  const def = defQuery.data!;

  const handleVote = (vote: 'up' | 'down') => {
    voteMutation.mutate({ definitionId: id, vote });
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    commentMutation.mutate({ id, comment });
  };

  return (
    <div>
      <h2>{def.term}</h2>
      <p>{def.definition}</p>
      <p>{def.example}</p>
      <div>
        <button onClick={() => handleVote('up')}>⬆</button>
        <span>{def.score}</span>
        <button onClick={() => handleVote('down')}>⬇</button>
      </div>
      <div>
        Tags: {tagsQuery.data?.map((t) => (
          <span key={t.id}>{t.name} </span>
        ))}
      </div>
      <div>
        <h3>Comments</h3>
        {commentsQuery.data?.map((c) => (
          <div key={c.id}>
            <b>{c.author.name}:</b> {c.message}
          </div>
        ))}
        <form onSubmit={handleComment}>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button type="submit" disabled={commentMutation.isPending}>
            Add Comment
          </button>
        </form>
      </div>
    </div>
  );
}
