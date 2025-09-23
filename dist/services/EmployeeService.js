"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeService = void 0;
const prismaClient_1 = require("./prismaClient");
class EmployeeService {
    normalizePhoneNumber(input) {
        const digits = String(input || '').replace(/\D/g, '');
        if (digits.length >= 10) {
            return digits.slice(-10);
        }
        const err = new Error('Phone number must contain exactly 10 digits');
        // @ts-expect-error add status
        err.status = 400;
        throw err;
    }
    async listEmployees() {
        const items = await prismaClient_1.prisma.employee.findMany({
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
        return items;
    }
    async isEmailUnique(email, excludeId) {
        const normalized = String(email).trim().toLowerCase();
        const exists = await prismaClient_1.prisma.employee.findFirst({
            where: {
                email: normalized,
                isDeleted: false,
                NOT: excludeId ? { employeeId: excludeId } : undefined
            }
        });
        return !exists;
    }
    async createEmployee(employeeData, files) {
        const phone = this.normalizePhoneNumber(employeeData.phoneNumber);
        try {
            // Ensure files are provided
            if (!files?.image || !files?.document) {
                const e = new Error('Image and Document are required');
                // @ts-expect-error status
                e.status = 400;
                throw e;
            }
            const created = await prismaClient_1.prisma.employee.create({
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
            const result = await prismaClient_1.prisma.employee.findUnique({
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
            return result;
        }
        catch (err) {
            if (err?.code === 'P2002') {
                const e = new Error('Email must be unique');
                // @ts-expect-error add status
                e.status = 409;
                throw e;
            }
            throw err;
        }
    }
    async updateEmployee(employeeId, employeeData, files) {
        const phone = this.normalizePhoneNumber(employeeData.phoneNumber);
        try {
            // Build partial update object to avoid overwriting when fields are omitted
            const updateData = {
                firstName: employeeData.firstName,
                lastName: employeeData.lastName,
                email: String(employeeData.email).trim().toLowerCase(),
                department: employeeData.department,
                position: employeeData.position,
                salary: employeeData.salary,
                dateOfJoining: new Date(`${employeeData.dateOfJoining}T00:00:00.000Z`),
                address: employeeData.address,
                updatedBy: 1,
                isActive: typeof employeeData.isActive === 'boolean' ? employeeData.isActive : true,
            };
            if (employeeData.phoneNumber) {
                updateData.phoneNumber = phone;
            }
            if (files?.image) {
                updateData.imageMimeType = files.image.mimetype;
                updateData.imageData = files.image.buffer;
            }
            if (files?.document) {
                updateData.documentMimeType = files.document.mimetype;
                updateData.documentData = files.document.buffer;
            }
            const updated = await prismaClient_1.prisma.employee.update({
                where: { employeeId },
                data: updateData
            });
            const result = await prismaClient_1.prisma.employee.findUnique({
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
            return result;
        }
        catch (err) {
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
    async deleteEmployee(employeeId) {
        try {
            await prismaClient_1.prisma.employee.update({ where: { employeeId }, data: { isDeleted: true, updatedBy: 1 } });
        }
        catch (err) {
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
exports.EmployeeService = EmployeeService;
