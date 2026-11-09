export default function ArticleContent({ content }: { content: string }) {
  return (
    <article
      className="
        max-w-none break-words
        text-lg leading-relaxed
        md:text-xl

        [&_p]:mb-5
        [&_p]:text-lg [&_p]:leading-relaxed
        md:[&_p]:text-xl

        [&_h1]:mb-5 [&_h1]:mt-10
        [&_h1]:text-3xl [&_h1]:font-bold

        [&_h2]:mb-4 [&_h2]:mt-8
        [&_h2]:text-2xl [&_h2]:font-bold

        [&_h3]:mb-3 [&_h3]:mt-6
        [&_h3]:text-xl [&_h3]:font-bold

        [&_strong]:font-bold
        [&_ul]:mb-5 [&_ul]:list-disc [&_ul]:pl-7
        [&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:pl-7
        [&_li]:text-lg
        md:[&_li]:text-xl

        [&_blockquote]:my-6
        [&_blockquote]:border-l-4
        [&_blockquote]:border-[var(--color-brand-300)]
        [&_blockquote]:bg-[var(--color-bg-muted)]
        [&_blockquote]:p-4
        [&_blockquote]:rounded-r-2xl
        [&_blockquote]:italic

        [&_hr]:my-8
        [&_hr]:border-[var(--color-brand-50)]
        [&_a]:text-[var(--color-brand-400)] [&_a]:underline
        [&_img]:my-6 [&_img]:block [&_img]:h-auto [&_img]:w-full
        [&_img]:rounded-2xl [&_img]:object-contain
      "
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
