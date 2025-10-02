/*
  Warnings:

  - You are about to alter the column `createdAt` on the `Employee` table. The data in that column could be lost. The data in that column will be cast from `DateTime2` to `Date`.
  - You are about to alter the column `updatedAt` on the `Employee` table. The data in that column could be lost. The data in that column will be cast from `DateTime2` to `Date`.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Employee] ALTER COLUMN [createdAt] DATE NOT NULL;
ALTER TABLE [dbo].[Employee] ALTER COLUMN [updatedAt] DATE NOT NULL;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
