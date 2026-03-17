-- Add nullable image column for existing Category rows (no data loss)
ALTER TABLE "Category"
ADD COLUMN "image" TEXT;
