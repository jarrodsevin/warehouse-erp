 
-- Create ScheduledReportBatch table
CREATE TABLE "ScheduledReportBatch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "emailAddress" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "frequency" TEXT NOT NULL,
    "scheduledDays" TEXT,
    "scheduledTime" TEXT NOT NULL DEFAULT '09:00',
    "lastSentAt" TIMESTAMP(3),
    "nextScheduledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledReportBatch_pkey" PRIMARY KEY ("id")
);

-- Create ScheduledReportItem table
CREATE TABLE "ScheduledReportItem" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "filterConfig" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledReportItem_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraint
ALTER TABLE "ScheduledReportItem" ADD CONSTRAINT "ScheduledReportItem_batchId_fkey" 
    FOREIGN KEY ("batchId") REFERENCES "ScheduledReportBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create indexes
CREATE INDEX "ScheduledReportBatch_status_idx" ON "ScheduledReportBatch"("status");
CREATE INDEX "ScheduledReportBatch_nextScheduledAt_idx" ON "ScheduledReportBatch"("nextScheduledAt");
CREATE INDEX "ScheduledReportItem_batchId_idx" ON "ScheduledReportItem"("batchId");
CREATE INDEX "ScheduledReportItem_orderIndex_idx" ON "ScheduledReportItem"("orderIndex");