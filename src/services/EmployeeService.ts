import { prisma } from './prismaClient';
import { EmployeeCreateRequest, EmployeeUpdateRequest, EmployeeResponse } from '../models/employee';

export class EmployeeService {
  private normalizePhoneNumber(input?: string): string | undefined {
    if (input == null) return undefined;
    const digits = String(input).replace(/\D/g, '');
    if (digits.length === 0) return undefined;
    if (digits.length >= 10) return digits.slice(-10);
    const err = new Error('Phone number must contain exactly 10 digits');
    // @ts-expect-error add status
    err.status = 400;
    throw err;
  }
  public async listEmployees(): Promise<EmployeeResponse[]> {
    const items = await prisma.employee.findMany({
      where: { isDeleted: false },
      orderBy: { employeeId: 'asc' },
      select: {
        employeeId: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        department: true,
        position: true,
        salary: true,
        dateOfJoining: true,
        address: true,
        isActive: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
      }
    });
    return items as unknown as EmployeeResponse[];
  }

  public async isEmailUnique(email: string, excludeId?: number): Promise<boolean> {
    const normalized = String(email).trim().toLowerCase();
    const exists = await prisma.employee.findFirst({
      where: {
        email: normalized,
        isDeleted: false,
        NOT: excludeId ? { employeeId: excludeId } : undefined
      }
    });
    return !exists;
  }

  public async createEmployee(employeeData: EmployeeCreateRequest, files?: { image?: Express.Multer.File; document?: Express.Multer.File }): Promise<EmployeeResponse> {
    const phone = this.normalizePhoneNumber(employeeData.phoneNumber)!;
    try {
      // Ensure files are provided
      if (!files?.image || !files?.document) {
        const e = new Error('Image and Document are required');
        // @ts-expect-error status
        e.status = 400;
        throw e;
      }
      const created = await prisma.employee.create({
        data: {
          firstName: employeeData.firstName,
          lastName: employeeData.lastName,
          email: String(employeeData.email).trim().toLowerCase(),
          phoneNumber: phone,
          department: employeeData.department,
          position: employeeData.position,
          salary: employeeData.salary,
          dateOfJoining: new Date(`${employeeData.dateOfJoining}T00:00:00.000Z`),
          address: employeeData.address,
          createdBy: 1,
          updatedBy: 1,
          isActive: typeof employeeData.isActive === 'boolean' ? employeeData.isActive : true,
          isDeleted: false,
          imageMimeType: files.image.mimetype,
          imageData: files.image.buffer,
          documentMimeType: files.document.mimetype,
          documentData: files.document.buffer,
        }
      });
      // Return sanitized record without file buffers
      const result = await prisma.employee.findUnique({
        where: { employeeId: created.employeeId },
        select: {
          employeeId: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          department: true,
          position: true,
          salary: true,
          dateOfJoining: true,
          address: true,
          isActive: true,
          isDeleted: true,
          createdAt: true,
          updatedAt: true,
        }
      });
      return result as unknown as EmployeeResponse;
    } catch (err: any) {
      if (err?.code === 'P2002') {
        const e = new Error('Email must be unique');
        // @ts-expect-error add status
        e.status = 409;
        throw e;
      }
      throw err;
    }
  }

  public async updateEmployee(employeeId: number, employeeData: EmployeeUpdateRequest, files?: { image?: Express.Multer.File; document?: Express.Multer.File }): Promise<EmployeeResponse> {
    const phone = this.normalizePhoneNumber(employeeData.phoneNumber);
    try {
      // Build partial update object to avoid overwriting when fields are omitted
      const updateData: any = { updatedBy: 1 };
      if (employeeData.firstName != null) updateData.firstName = employeeData.firstName;
      if (employeeData.lastName != null) updateData.lastName = employeeData.lastName;
      if (employeeData.email != null) updateData.email = String(employeeData.email).trim().toLowerCase();
      if (employeeData.department != null) updateData.department = employeeData.department;
      if (employeeData.position != null) updateData.position = employeeData.position;
      if (employeeData.salary != null) updateData.salary = employeeData.salary;
      if (employeeData.dateOfJoining != null && employeeData.dateOfJoining !== '') {
        const parsed = new Date(`${employeeData.dateOfJoining}T00:00:00.000Z`);
        if (isNaN(parsed.getTime())) {
          const e = new Error('Invalid dateOfJoining');
          // @ts-expect-error status
          e.status = 400;
          throw e;
        }
        updateData.dateOfJoining = parsed;
      }
      if (employeeData.address != null) updateData.address = employeeData.address;
      if (typeof employeeData.isActive === 'boolean') updateData.isActive = employeeData.isActive;
      if (phone !== undefined) updateData.phoneNumber = phone;
      if (files?.image) {
        updateData.imageMimeType = files.image.mimetype;
        updateData.imageData = files.image.buffer;
      }
      if (files?.document) {
        updateData.documentMimeType = files.document.mimetype;
        updateData.documentData = files.document.buffer;
      }
      const updated = await prisma.employee.update({
        where: { employeeId },
        data: updateData
      });
      const result = await prisma.employee.findUnique({
        where: { employeeId: updated.employeeId },
        select: {
          employeeId: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          department: true,
          position: true,
          salary: true,
          dateOfJoining: true,
          address: true,
          isActive: true,
          isDeleted: true,
          createdAt: true,
          updatedAt: true,
        }
      });
      return result as unknown as EmployeeResponse;
    } catch (err: any) {
      if (err?.code === 'P2002') {
        const e = new Error('Email must be unique');
        // @ts-expect-error add status
        e.status = 409;
        throw e;
      }
      if (err?.code === 'P2025') {
        const e = new Error('Employee not found');
        // @ts-expect-error add status
        e.status = 404;
        throw e;
      }
      throw err;
    }
  }

  public async deleteEmployee(employeeId: number): Promise<void> {
    try {
      await prisma.employee.update({ where: { employeeId }, data: { isDeleted: true, updatedBy: 1 } });
    } catch (err: any) {
      if (err?.code === 'P2025') {
        const e = new Error('Employee not found');
        // @ts-expect-error add status
        e.status = 404;
        throw e;
      }
      throw err;
    }
  }
}


