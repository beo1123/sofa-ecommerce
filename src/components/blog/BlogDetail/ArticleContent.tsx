export default function ArticleContent({ content }: { content: string }) {
  return (
    <article className="prose prose-lg max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: content }} />
  );
}
