-- Enable cascade delete for Game-related relations and their dependents

ALTER TABLE "DeveloperGame" DROP CONSTRAINT "DeveloperGame_gameId_fkey";
ALTER TABLE "DeveloperGame" ADD CONSTRAINT "DeveloperGame_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserGame" DROP CONSTRAINT "UserGame_gameId_fkey";
ALTER TABLE "UserGame" ADD CONSTRAINT "UserGame_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Thread" DROP CONSTRAINT "Thread_gameId_fkey";
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Post" DROP CONSTRAINT "Post_threadId_fkey";
ALTER TABLE "Post" ADD CONSTRAINT "Post_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BugReport" DROP CONSTRAINT "BugReport_gameId_fkey";
ALTER TABLE "BugReport" ADD CONSTRAINT "BugReport_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BugReportComment" DROP CONSTRAINT "BugReportComment_bugReportId_fkey";
ALTER TABLE "BugReportComment" ADD CONSTRAINT "BugReportComment_bugReportId_fkey" FOREIGN KEY ("bugReportId") REFERENCES "BugReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BugReportStatusChange" DROP CONSTRAINT "BugReportStatusChange_bugReportId_fkey";
ALTER TABLE "BugReportStatusChange" ADD CONSTRAINT "BugReportStatusChange_bugReportId_fkey" FOREIGN KEY ("bugReportId") REFERENCES "BugReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
