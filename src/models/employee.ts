// Data contracts (DTOs) used by controllers and services

export interface EmployeeCreateRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string; 
  department: string;
  position: string;
  salary: number;
  dateOfJoining: string; 
  address: string;
  isActive?: boolean;
}

export interface EmployeeUpdateRequest extends EmployeeCreateRequest {}

export interface EmployeeResponse extends EmployeeCreateRequest {
  employeeId: number;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}


