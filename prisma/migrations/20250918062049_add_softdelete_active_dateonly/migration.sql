/*
  Warnings:

  - You are about to alter the column `dateOfJoining` on the `Employee` table. The data in that column could be lost. The data in that column will be cast from `DateTime2` to `Date`.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Employee] ALTER COLUMN [dateOfJoining] DATE NOT NULL;
ALTER TABLE [dbo].[Employee] ADD [isActive] BIT NOT NULL CONSTRAINT [Employee_isActive_df] DEFAULT 1,
[isDeleted] BIT NOT NULL CONSTRAINT [Employee_isDeleted_df] DEFAULT 0;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
