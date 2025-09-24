-- Video tablosu ekleme SQL'i
CREATE TABLE IF NOT EXISTS "ad_videos" (
    "id" SERIAL PRIMARY KEY,
    "ad_id" INTEGER NOT NULL,
    "video_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "duration" INTEGER,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "display_order" INTEGER DEFAULT 1,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "ad_videos_ad_id_fkey" FOREIGN KEY ("ad_id") REFERENCES "ads" ("id") ON DELETE CASCADE
);

-- Index ekleme
CREATE INDEX IF NOT EXISTS "ad_videos_ad_id_idx" ON "ad_videos"("ad_id");

-- Prisma migration tabloya kayıt ekleme (opsiyonel)
INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count")
VALUES (
    gen_random_uuid()::text,
    'manual_add_video_table',
    NOW(),
    '20250924000000_add_ad_video_manual',
    NULL,
    NULL,
    NOW(),
    1
) ON CONFLICT DO NOTHING;