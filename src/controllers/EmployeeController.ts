import { Controller, Get, Post, Put, Delete, Route, Tags, SuccessResponse, Response, Query, Path, Consumes, UploadedFile, FormField } from 'tsoa';
import { EmployeeService } from '../services/EmployeeService';
import { EmployeeResponse } from '../models/employee';

@Route('api/employees')
@Tags('Employees')
export class EmployeeController extends Controller {
  private service = new EmployeeService();

  @Get('')
  public async listEmployees(): Promise<EmployeeResponse[]> {
    return this.service.listEmployees();
  }

  /** Search employees with pagination */
  @Get('search')
  public async search(
    @Query() q?: string,
    @Query() page?: number,
    @Query() pageSize?: number,
    @Query() sort?: string,
  ): Promise<{ items: EmployeeResponse[]; total: number; page: number; pageSize: number }> {
    return this.service.searchEmployees(q || '', page, pageSize, sort);
  }

  @Get('check-email')
  public async checkEmail(@Query() email: string, @Query() excludeId?: number): Promise<{ isUnique: boolean }> {
    if (!email) {
      this.setStatus(400);
      return { isUnique: false };
    }
    const isUnique = await this.service.isEmailUnique(email, excludeId);
    return { isUnique };
  }

  /** Get single employee by id */
  @Get('{employeeId}')
  public async getEmployee(@Path() employeeId: number): Promise<EmployeeResponse> {
    return this.service.getEmployeeById(employeeId);
  }

  /** Create employee */
  @SuccessResponse('201', 'Created')
  @Response('409', 'Email must be unique')
  @Consumes('multipart/form-data')
  @Post('')
  public async createEmployee(
    @FormField() firstName: string,
    @FormField() lastName: string,
    @FormField() email: string,
    @FormField() phoneNumber: string,
    @FormField() department: string,
    @FormField() position: string,
    @FormField() salary: number,
    @FormField() dateOfJoining: string,
    @FormField() address: string,
    @FormField() isActive: boolean,
    @UploadedFile() image: Express.Multer.File,
    @UploadedFile('document') document: Express.Multer.File,
  ): Promise<EmployeeResponse> {
    const employeeData = { firstName, lastName, email, phoneNumber, department, position, salary, dateOfJoining, address, isActive };
    const created = await this.service.createEmployee(employeeData, { image, document });
    this.setStatus(201);
    return created;
  }

  /** Update employee */
  @Response('404', 'Employee not found')
  @Response('409', 'Email must be unique')
  @Consumes('multipart/form-data')
  @Put('{employeeId}')
  public async updateEmployee(
    @Path() employeeId: number,
    @FormField() firstName?: string,
    @FormField() lastName?: string,
    @FormField() email?: string,
    @FormField() department?: string,
    @FormField() position?: string,
    @FormField() salary?: number,
    @FormField() dateOfJoining?: string,
    @FormField() address?: string,
    @FormField() isActive?: boolean,
    @FormField() phoneNumber?: string,
    @UploadedFile() image?: Express.Multer.File,
    @UploadedFile('document') document?: Express.Multer.File,
  ): Promise<EmployeeResponse> {
    const cleanValue = (val: any) => {
      if (val === undefined || val === null) return undefined;
      const str = String(val).trim();
      if (str === '' || str === 'string') return undefined;
      return val;
    };
    const salaryVal = cleanValue(salary) !== undefined ? Number(cleanValue(salary)) : undefined;
    const isActiveVal = cleanValue(isActive);
    const employeeData = {
      firstName: cleanValue(firstName),
      lastName: cleanValue(lastName),
      email: cleanValue(email),
      phoneNumber: cleanValue(phoneNumber),
      department: cleanValue(department),
      position: cleanValue(position),
      salary: salaryVal,
      dateOfJoining: cleanValue(dateOfJoining),
      address: cleanValue(address),
      isActive: typeof isActiveVal === 'string' ? isActiveVal === 'true' : isActiveVal,
    } as any;
    return this.service.updateEmployee(employeeId, employeeData, { image, document });
  }

  /** Soft delete employee */
  @SuccessResponse('204', 'No Content')
  @Response('404', 'Employee not found')
  @Delete('{employeeId}')
  public async deleteEmployee(@Path() employeeId: number): Promise<void> {
    await this.service.deleteEmployee(employeeId);
    this.setStatus(204);
    return;
  }

  @Get('{employeeId}/image/meta')
  public async getEmployeeImageMeta(@Path() employeeId: number): Promise<{ mimeType: string | null; sizeBytes: number | null; fileName: string | null }> {
    return this.service.getEmployeeFileMeta(employeeId, 'image');
  }

  @Get('{employeeId}/document/meta')
  public async getEmployeeDocumentMeta(@Path() employeeId: number): Promise<{ mimeType: string | null; sizeBytes: number | null; fileName: string | null }> {
    return this.service.getEmployeeFileMeta(employeeId, 'document');
  }

  /** Stream employee image bytes */
  @Get('{employeeId}/image')
  public async getEmployeeImage(@Path() employeeId: number): Promise<any> {
    const file = await this.service.getEmployeeFile(employeeId, 'image');
    this.setHeader('Content-Type', file.mimeType);
    this.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.fileName)}"`);
    this.setHeader('Cache-Control', 'private, max-age=300');
    return file.data;
  }

  /** Stream employee document bytes */
  @Get('{employeeId}/document')
  public async getEmployeeDocument(@Path() employeeId: number): Promise<any> {
    const file = await this.service.getEmployeeFile(employeeId, 'document');
    this.setHeader('Content-Type', file.mimeType);
    this.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.fileName)}"`);
    this.setHeader('Cache-Control', 'private, max-age=300');
    return file.data;
  }

}


