import { prisma } from './prismaClient';
import { Prisma } from '@prisma/client';
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
      orderBy: { employeeId: 'desc' },
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

  public async getEmployeeById(employeeId: number): Promise<EmployeeResponse> {
    const item = await prisma.employee.findFirst({
      where: { employeeId, isDeleted: false },
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
    if (!item) {
      const e = new Error('Employee not found');
      // @ts-expect-error status
      e.status = 404;
      throw e;
    }
    return item as unknown as EmployeeResponse;
  }

  public async getEmployeeFile(
    employeeId: number,
    kind: 'image' | 'document'
  ): Promise<{ mimeType: string; data: Buffer; fileName: string }> {
    const select: any =
      kind === 'image'
        ? { imageMimeType: true, imageData: true, imageFileName: true }
        : { documentMimeType: true, documentData: true, documentFileName: true };
    const item = await prisma.employee.findFirst({
      where: { employeeId, isDeleted: false },
      select
    });
    if (!item) {
      const e = new Error('Employee not found');
      // @ts-expect-error status
      e.status = 404;
      throw e;
    }
    const mimeType = (kind === 'image' ? (item as any).imageMimeType : (item as any).documentMimeType) as string | null;
    let data = (kind === 'image' ? (item as any).imageData : (item as any).documentData) as any;
    // Coerce to Buffer if Prisma driver returns other formats or legacy base64 strings exist
    if (data && !Buffer.isBuffer(data)) {
      if (typeof data === 'string') {
        // Try base64 decode, fall back to utf8 bytes
        try { data = Buffer.from(data, 'base64'); }
        catch { data = Buffer.from(data, 'utf8'); }
      } else if (data?.type === 'Buffer' && Array.isArray(data?.data)) {
        data = Buffer.from(data.data);
      } else if (ArrayBuffer.isView(data)) {
        data = Buffer.from(data as Uint8Array);
      }
    }
    const fileName = (kind === 'image' ? (item as any).imageFileName : (item as any).documentFileName) as string | null;
    if (!mimeType || !data) {
      const e = new Error('File not found');
      // @ts-expect-error status
      e.status = 404;
      throw e;
    }
    return { mimeType, data, fileName: fileName || (kind === 'image' ? 'image' : 'document') };
  }

  public async getEmployeeFileMeta(
    employeeId: number,
    kind: 'image' | 'document'
  ): Promise<{ mimeType: string | null; sizeBytes: number | null; fileName: string | null }> {
    const select: any =
      kind === 'image'
        ? { imageMimeType: true, imageData: true }
        : { documentMimeType: true, documentData: true };
    const item = await prisma.employee.findFirst({
      where: { employeeId, isDeleted: false },
      select
    });
    if (!item) {
      const e = new Error('Employee not found');
      // @ts-expect-error status
      e.status = 404;
      throw e;
    }
    const mimeType = (kind === 'image' ? (item as any).imageMimeType : (item as any).documentMimeType) as string | null;
    const fileName = (kind === 'image' ? (item as any).imageFileName : (item as any).documentFileName) as string | null;
    const data = (kind === 'image' ? (item as any).imageData : (item as any).documentData) as Buffer | null;
    return { mimeType: mimeType || null, fileName: fileName || null, sizeBytes: data ? data.length : null };
  }

  public async searchEmployees(
    query: string,
    page: number = 1,
    pageSize: number = 10,
    sort?: string
  ): Promise<{ items: EmployeeResponse[]; total: number; page: number; pageSize: number }> {
    const q = String(query || '').trim();
    const token = String(sort || '').toLowerCase();
    const skip = (Math.max(page, 1) - 1) * Math.max(pageSize, 1);
    const take = Math.max(pageSize, 1);

    const where: any = { isDeleted: false };
    const or: any[] = [];
    if (q) {
      const text = q.toLowerCase();
      or.push({ firstName: { contains: text } });
      or.push({ lastName: { contains: text } });
      or.push({ email: { contains: text } });
      or.push({ department: { contains: text } });
      or.push({ position: { contains: text } });

      const norm = q.replace(/\//g, '-');
      // Full date yyyy-mm-dd
      if (/^\d{4}-\d{2}-\d{2}$/.test(norm)) {
        const d = new Date(`${norm}T00:00:00.000Z`);
        const next = new Date(d); next.setUTCDate(next.getUTCDate() + 1);
        or.push({ dateOfJoining: { gte: d, lt: next } });
      }
      // Full date dd-mm-yyyy
      else if (/^\d{2}-\d{2}-\d{4}$/.test(norm)) {
        const [dd, mm, yyyy] = norm.split('-');
        const iso = `${yyyy}-${mm}-${dd}`;
        const d = new Date(`${iso}T00:00:00.000Z`);
        const next = new Date(d); next.setUTCDate(next.getUTCDate() + 1);
        or.push({ dateOfJoining: { gte: d, lt: next } });
      }
      // Year prefix 1-4 digits (interpret as a full year range)
      if (/^\d{1,4}$/.test(norm)) {
        const y = parseInt(norm, 10);
        const start = new Date(Date.UTC(y, 0, 1));
        const end = new Date(Date.UTC(y + 1, 0, 1));
        or.push({ dateOfJoining: { gte: start, lt: end } });
      }
    }

    // Day or month (1–2 digits) partial using small raw lookup to collect ids
    if (/^\d{1,2}$/.test(q)) {
      const dm = parseInt(q, 10);
      const idRows = await prisma.$queryRawUnsafe<{ employeeId: number }[]>(
        'SELECT [employeeId] FROM [dbo].[Employee] WHERE [isDeleted] = 0 AND (DATEPART(day, [dateOfJoining]) = @P1 OR DATEPART(month, [dateOfJoining]) = @P2)',
        dm, dm
      );
      const ids = idRows.map(r => Number(r.employeeId)).filter(n => Number.isFinite(n));
      if (ids.length) or.push({ employeeId: { in: ids } });
    }

    if (or.length) where.OR = or;

    let orderBy: any = { employeeId: 'desc' };
    if (token === 'nameasc') orderBy = [{ firstName: 'asc' }, { lastName: 'asc' }, { employeeId: 'desc' }];
    else if (token === 'dojasc') orderBy = [{ dateOfJoining: 'asc' }, { employeeId: 'desc' }];
    else if (token === 'emailasc') orderBy = [{ email: 'asc' }, { employeeId: 'desc' }];
    else if (token === 'departmentasc') orderBy = [{ department: 'asc' }, { employeeId: 'desc' }];
    else if (token === 'positionasc') orderBy = [{ position: 'asc' }, { employeeId: 'desc' }];

    const [total, rows] = await Promise.all([
      prisma.employee.count({ where }),
      prisma.employee.findMany({
        where,
        orderBy,
        skip,
        take,
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
      })
    ]);

    return { items: rows as unknown as EmployeeResponse[], total, page, pageSize: take };
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
          imageFileName: files.image.originalname,
          imageData: files.image.buffer,
          documentMimeType: files.document.mimetype,
          documentFileName: files.document.originalname,
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
        updateData.imageFileName = files.image.originalname;
        updateData.imageData = files.image.buffer;
      }
      if (files?.document) {
        updateData.documentMimeType = files.document.mimetype;
        updateData.documentFileName = files.document.originalname;
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


