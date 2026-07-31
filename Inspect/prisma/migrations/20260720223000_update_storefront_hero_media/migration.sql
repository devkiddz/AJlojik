ALTER TABLE "storefront_hero"
ALTER COLUMN "mediaUrl" SET DEFAULT 'https://www.youtube.com/watch?v=WN_fa23hasc',
ALTER COLUMN "posterUrl" SET DEFAULT 'https://images.unsplash.com/photo-1575444758702-4a6b9222336e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

UPDATE "storefront_hero"
SET "mediaType" = 'VIDEO',
    "mediaUrl" = 'https://www.youtube.com/watch?v=WN_fa23hasc',
    "posterUrl" = 'https://images.unsplash.com/photo-1575444758702-4a6b9222336e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    "updatedAt" = CURRENT_TIMESTAMP;
