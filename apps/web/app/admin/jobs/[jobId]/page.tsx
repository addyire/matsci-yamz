export default async function JobPage(props: {
  params: Promise<{ jobId: string }>;
}) {
  const params = await props.params;

  return <div>{params.jobId}</div>;
}
