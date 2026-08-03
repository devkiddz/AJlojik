-- CreateTable
CREATE TABLE "support_knowledge_bucket" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_knowledge_bucket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_knowledge_entry" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "bucketId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "intent" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "followUp" TEXT,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sampleQuestions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "actions" JSONB,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_knowledge_entry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "support_knowledge_bucket_workspaceId_slug_key"
ON "support_knowledge_bucket"("workspaceId", "slug");

-- CreateIndex
CREATE INDEX "support_knowledge_bucket_workspaceId_active_priority_idx"
ON "support_knowledge_bucket"("workspaceId", "active", "priority");

-- CreateIndex
CREATE UNIQUE INDEX "support_knowledge_entry_workspaceId_slug_key"
ON "support_knowledge_entry"("workspaceId", "slug");

-- CreateIndex
CREATE INDEX "support_knowledge_entry_workspaceId_intent_idx"
ON "support_knowledge_entry"("workspaceId", "intent");

-- CreateIndex
CREATE INDEX "support_knowledge_entry_workspaceId_active_verified_priority_idx"
ON "support_knowledge_entry"("workspaceId", "active", "verified", "priority");

-- CreateIndex
CREATE INDEX "support_knowledge_entry_bucketId_priority_idx"
ON "support_knowledge_entry"("bucketId", "priority");

-- AddForeignKey
ALTER TABLE "support_knowledge_bucket"
ADD CONSTRAINT "support_knowledge_bucket_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_knowledge_entry"
ADD CONSTRAINT "support_knowledge_entry_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_knowledge_entry"
ADD CONSTRAINT "support_knowledge_entry_bucketId_fkey"
FOREIGN KEY ("bucketId") REFERENCES "support_knowledge_bucket"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
