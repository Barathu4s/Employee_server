
-- Rename primary key column id -> employeeId on dbo.Employee
IF COL_LENGTH('dbo.Employee', 'employeeId') IS NULL
BEGIN
  EXEC sp_rename 'dbo.Employee.id', 'employeeId', 'COLUMN';
END
