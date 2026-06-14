-- Rename and convert Post JSON text columns to JSONB
ALTER TABLE "Post" RENAME COLUMN "tagsJson" TO "tags";
ALTER TABLE "Post" ALTER COLUMN "tags" TYPE JSONB USING "tags"::JSONB;

ALTER TABLE "Post" RENAME COLUMN "imagesJson" TO "images";
ALTER TABLE "Post" ALTER COLUMN "images" TYPE JSONB USING "images"::JSONB;

-- Rename and convert Project JSON text column to JSONB
ALTER TABLE "Project" RENAME COLUMN "techJson" TO "tech";
ALTER TABLE "Project" ALTER COLUMN "tech" TYPE JSONB USING "tech"::JSONB;
