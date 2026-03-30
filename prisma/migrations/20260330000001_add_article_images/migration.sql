-- CreateTable: ArticleImage (multi-image support for articles, mirrors ProductImage)
CREATE TABLE "ArticleImage" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "articleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArticleImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_articleimage_article" ON "ArticleImage"("articleId");

-- AddForeignKey (cascade so rows are cleaned up on hard-delete of parent Article)
ALTER TABLE "ArticleImage" ADD CONSTRAINT "ArticleImage_articleId_fkey"
    FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
