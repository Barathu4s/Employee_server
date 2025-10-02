"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeController = void 0;
const tsoa_1 = require("tsoa");
const EmployeeService_1 = require("../services/EmployeeService");
let EmployeeController = class EmployeeController extends tsoa_1.Controller {
    constructor() {
        super(...arguments);
        this.service = new EmployeeService_1.EmployeeService();
    }
    async listEmployees() {
        return this.service.listEmployees();
    }
    /** Search employees with pagination */
    async search(q, page, pageSize, sort) {
        return this.service.searchEmployees(q || '', page, pageSize, sort);
    }
    async checkEmail(email, excludeId) {
        if (!email) {
            this.setStatus(400);
            return { isUnique: false };
        }
        const isUnique = await this.service.isEmailUnique(email, excludeId);
        return { isUnique };
    }
    /** Get single employee by id */
    async getEmployee(employeeId) {
        return this.service.getEmployeeById(employeeId);
    }
    /** Create employee */
    async createEmployee(firstName, lastName, email, phoneNumber, department, position, salary, dateOfJoining, address, isActive, image, document) {
        const employeeData = { firstName, lastName, email, phoneNumber, department, position, salary, dateOfJoining, address, isActive };
        const created = await this.service.createEmployee(employeeData, { image, document });
        this.setStatus(201);
        return created;
    }
    /** Update employee */
    async updateEmployee(employeeId, firstName, lastName, email, department, position, salary, dateOfJoining, address, isActive, phoneNumber, image, document) {
        const cleanValue = (val) => {
            if (val === undefined || val === null)
                return undefined;
            const str = String(val).trim();
            if (str === '' || str === 'string')
                return undefined;
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
        };
        return this.service.updateEmployee(employeeId, employeeData, { image, document });
    }
    /** Soft delete employee */
    async deleteEmployee(employeeId) {
        await this.service.deleteEmployee(employeeId);
        this.setStatus(204);
        return;
    }
    async getEmployeeImageMeta(employeeId) {
        return this.service.getEmployeeFileMeta(employeeId, 'image');
    }
    async getEmployeeDocumentMeta(employeeId) {
        return this.service.getEmployeeFileMeta(employeeId, 'document');
    }
    /** Stream employee image bytes */
    async getEmployeeImage(employeeId) {
        const file = await this.service.getEmployeeFile(employeeId, 'image');
        this.setHeader('Content-Type', file.mimeType);
        this.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.fileName)}"`);
        this.setHeader('Cache-Control', 'private, max-age=300');
        return file.data;
    }
    /** Stream employee document bytes */
    async getEmployeeDocument(employeeId) {
        const file = await this.service.getEmployeeFile(employeeId, 'document');
        this.setHeader('Content-Type', file.mimeType);
        this.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.fileName)}"`);
        this.setHeader('Cache-Control', 'private, max-age=300');
        return file.data;
    }
};
exports.EmployeeController = EmployeeController;
__decorate([
    (0, tsoa_1.Get)(''),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "listEmployees", null);
__decorate([
    (0, tsoa_1.Get)('search'),
    __param(0, (0, tsoa_1.Query)()),
    __param(1, (0, tsoa_1.Query)()),
    __param(2, (0, tsoa_1.Query)()),
    __param(3, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, String]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "search", null);
__decorate([
    (0, tsoa_1.Get)('check-email'),
    __param(0, (0, tsoa_1.Query)()),
    __param(1, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "checkEmail", null);
__decorate([
    (0, tsoa_1.Get)('{employeeId}'),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getEmployee", null);
__decorate([
    (0, tsoa_1.SuccessResponse)('201', 'Created'),
    (0, tsoa_1.Response)('409', 'Email must be unique'),
    (0, tsoa_1.Consumes)('multipart/form-data'),
    (0, tsoa_1.Post)(''),
    __param(0, (0, tsoa_1.FormField)()),
    __param(1, (0, tsoa_1.FormField)()),
    __param(2, (0, tsoa_1.FormField)()),
    __param(3, (0, tsoa_1.FormField)()),
    __param(4, (0, tsoa_1.FormField)()),
    __param(5, (0, tsoa_1.FormField)()),
    __param(6, (0, tsoa_1.FormField)()),
    __param(7, (0, tsoa_1.FormField)()),
    __param(8, (0, tsoa_1.FormField)()),
    __param(9, (0, tsoa_1.FormField)()),
    __param(10, (0, tsoa_1.UploadedFile)()),
    __param(11, (0, tsoa_1.UploadedFile)('document')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, Number, String, String, Boolean, Object, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "createEmployee", null);
__decorate([
    (0, tsoa_1.Response)('404', 'Employee not found'),
    (0, tsoa_1.Response)('409', 'Email must be unique'),
    (0, tsoa_1.Consumes)('multipart/form-data'),
    (0, tsoa_1.Put)('{employeeId}'),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.FormField)()),
    __param(2, (0, tsoa_1.FormField)()),
    __param(3, (0, tsoa_1.FormField)()),
    __param(4, (0, tsoa_1.FormField)()),
    __param(5, (0, tsoa_1.FormField)()),
    __param(6, (0, tsoa_1.FormField)()),
    __param(7, (0, tsoa_1.FormField)()),
    __param(8, (0, tsoa_1.FormField)()),
    __param(9, (0, tsoa_1.FormField)()),
    __param(10, (0, tsoa_1.FormField)()),
    __param(11, (0, tsoa_1.UploadedFile)()),
    __param(12, (0, tsoa_1.UploadedFile)('document')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, String, String, String, Number, String, String, Boolean, String, Object, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "updateEmployee", null);
__decorate([
    (0, tsoa_1.SuccessResponse)('204', 'No Content'),
    (0, tsoa_1.Response)('404', 'Employee not found'),
    (0, tsoa_1.Delete)('{employeeId}'),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "deleteEmployee", null);
__decorate([
    (0, tsoa_1.Get)('{employeeId}/image/meta'),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getEmployeeImageMeta", null);
__decorate([
    (0, tsoa_1.Get)('{employeeId}/document/meta'),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getEmployeeDocumentMeta", null);
__decorate([
    (0, tsoa_1.Get)('{employeeId}/image'),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getEmployeeImage", null);
__decorate([
    (0, tsoa_1.Get)('{employeeId}/document'),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getEmployeeDocument", null);
exports.EmployeeController = EmployeeController = __decorate([
    (0, tsoa_1.Route)('api/employees'),
    (0, tsoa_1.Tags)('Employees')
], EmployeeController);
