/*
  Warnings:

  - You are about to alter the column `firstName` on the `Employee` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(1000)` to `VarChar(100)`.
  - You are about to alter the column `lastName` on the `Employee` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(1000)` to `VarChar(100)`.
  - You are about to alter the column `email` on the `Employee` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(1000)` to `VarChar(255)`.
  - You are about to alter the column `department` on the `Employee` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(1000)` to `VarChar(100)`.
  - You are about to alter the column `position` on the `Employee` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(1000)` to `VarChar(100)`.
  - You are about to alter the column `address` on the `Employee` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(1000)` to `VarChar(1000)`.

*/
BEGIN TRY

BEGIN TRAN;

-- DropIndex
ALTER TABLE [dbo].[Employee] DROP CONSTRAINT [Employee_email_key];

-- AlterTable
ALTER TABLE [dbo].[Employee] ALTER COLUMN [firstName] VARCHAR(100) NOT NULL;
ALTER TABLE [dbo].[Employee] ALTER COLUMN [lastName] VARCHAR(100) NOT NULL;
ALTER TABLE [dbo].[Employee] ALTER COLUMN [email] VARCHAR(255) NOT NULL;
ALTER TABLE [dbo].[Employee] ALTER COLUMN [department] VARCHAR(100) NOT NULL;
ALTER TABLE [dbo].[Employee] ALTER COLUMN [position] VARCHAR(100) NOT NULL;
ALTER TABLE [dbo].[Employee] ALTER COLUMN [address] VARCHAR(1000) NOT NULL;
ALTER TABLE [dbo].[Employee] ADD [createdBy] INT NOT NULL CONSTRAINT [Employee_createdBy_df] DEFAULT 1,
[updatedBy] INT NOT NULL CONSTRAINT [Employee_updatedBy_df] DEFAULT 1;

-- CreateIndex
ALTER TABLE [dbo].[Employee] ADD CONSTRAINT [Employee_email_key] UNIQUE NONCLUSTERED ([email]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
