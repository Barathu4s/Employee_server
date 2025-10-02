/*
  Warnings:

  - A unique constraint covering the columns `[email,isDeleted]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.

*/
BEGIN TRY

BEGIN TRAN;

-- DropIndex
ALTER TABLE [dbo].[Employee] DROP CONSTRAINT [Employee_email_key];

-- AlterTable
ALTER TABLE [dbo].[Employee] ADD [documentFileName] VARCHAR(255),
[imageFileName] VARCHAR(255);

-- CreateIndex
ALTER TABLE [dbo].[Employee] ADD CONSTRAINT [Employee_email_isDeleted_key] UNIQUE NONCLUSTERED ([email], [isDeleted]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
