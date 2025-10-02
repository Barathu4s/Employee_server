"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeService = void 0;
const prismaClient_1 = require("./prismaClient");
class EmployeeService {
    normalizePhoneNumber(input) {
        if (input == null)
            return undefined;
        const digits = String(input).replace(/\D/g, '');
        if (digits.length === 0)
            return undefined;
        if (digits.length >= 10)
            return digits.slice(-10);
        const err = new Error('Phone number must contain exactly 10 digits');
        // @ts-expect-error add status
        err.status = 400;
        throw err;
    }
    async listEmployees() {
        const items = await prismaClient_1.prisma.employee.findMany({
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
        return items;
    }
    async getEmployeeById(employeeId) {
        const item = await prismaClient_1.prisma.employee.findFirst({
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
        return item;
    }
    async getEmployeeFile(employeeId, kind) {
        const select = kind === 'image'
            ? { imageMimeType: true, imageData: true, imageFileName: true }
            : { documentMimeType: true, documentData: true, documentFileName: true };
        const item = await prismaClient_1.prisma.employee.findFirst({
            where: { employeeId, isDeleted: false },
            select
        });
        if (!item) {
            const e = new Error('Employee not found');
            // @ts-expect-error status
            e.status = 404;
            throw e;
        }
        const mimeType = (kind === 'image' ? item.imageMimeType : item.documentMimeType);
        const data = (kind === 'image' ? item.imageData : item.documentData);
        const fileName = (kind === 'image' ? item.imageFileName : item.documentFileName);
        if (!mimeType || !data) {
            const e = new Error('File not found');
            // @ts-expect-error status
            e.status = 404;
            throw e;
        }
        return { mimeType, data, fileName: fileName || (kind === 'image' ? 'image' : 'document') };
    }
    async getEmployeeFileMeta(employeeId, kind) {
        const select = kind === 'image'
            ? { imageMimeType: true, imageData: true }
            : { documentMimeType: true, documentData: true };
        const item = await prismaClient_1.prisma.employee.findFirst({
            where: { employeeId, isDeleted: false },
            select
        });
        if (!item) {
            const e = new Error('Employee not found');
            // @ts-expect-error status
            e.status = 404;
            throw e;
        }
        const mimeType = (kind === 'image' ? item.imageMimeType : item.documentMimeType);
        const fileName = (kind === 'image' ? item.imageFileName : item.documentFileName);
        const data = (kind === 'image' ? item.imageData : item.documentData);
        return { mimeType: mimeType || null, fileName: fileName || null, sizeBytes: data ? data.length : null };
    }
    async searchEmployees(query, page = 1, pageSize = 10, sort) {
        const q = String(query || '').trim();
        const where = { isDeleted: false };
        if (q) {
            // Try parse date for dateOfJoining search (support multiple formats)
            const parsedDayStarts = [];
            const norm = q.replace(/\//g, '-');
            const isoMatch = norm.match(/^\d{4}-\d{2}-\d{2}$/);
            const dmyMatch = norm.match(/^\d{2}-\d{2}-\d{4}$/);
            const yearOnly = norm.match(/^\d{4}$/);
            if (isoMatch) {
                const d = new Date(Date.UTC(parseInt(norm.slice(0, 4), 10), parseInt(norm.slice(5, 7), 10) - 1, parseInt(norm.slice(8, 10), 10)));
                if (!isNaN(d.getTime()))
                    parsedDayStarts.push(d);
            }
            else if (dmyMatch) {
                const [ddStr, mmStr, yyyyStr] = norm.split('-');
                const dd = parseInt(ddStr, 10);
                const mm = parseInt(mmStr, 10);
                const yyyy = parseInt(yyyyStr, 10);
                const d = new Date(Date.UTC(yyyy, mm - 1, dd));
                if (!isNaN(d.getTime()))
                    parsedDayStarts.push(d);
            }
            else if (yearOnly) {
                const yyyy = parseInt(norm, 10);
                const start = new Date(Date.UTC(yyyy, 0, 1));
                const end = new Date(Date.UTC(yyyy + 1, 0, 1));
                // Store a year range clause to OR with other text/date clauses
                where.__yearRangeClause = { dateOfJoining: { gte: start, lt: end } };
            }
            const text = q.toLowerCase();
            const textClauses = [
                { firstName: { contains: text } },
                { lastName: { contains: text } },
                { email: { contains: text } },
                { department: { contains: text } },
                { position: { contains: text } },
            ];
            // For date search on DATE column, match the whole day to avoid TZ issues
            const dateClauses = parsedDayStarts.length
                ? parsedDayStarts.map((start) => {
                    const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + 1));
                    return { dateOfJoining: { gte: start, lt: end } };
                })
                : [];
            const orClauses = [];
            orClauses.push(...textClauses);
            orClauses.push(...dateClauses);
            if (where.__yearRangeClause) {
                orClauses.push(where.__yearRangeClause);
                delete where.__yearRangeClause;
            }
            where.OR = orClauses;
        }
        const skip = (Math.max(page, 1) - 1) * Math.max(pageSize, 1);
        const take = Math.max(pageSize, 1);
        let orderBy = { employeeId: 'desc' };
        const token = String(sort || '').toLowerCase();
        if (token === 'nameasc') {
            orderBy = [{ firstName: 'asc' }, { lastName: 'asc' }, { employeeId: 'desc' }];
        }
        else if (token === 'dojasc') {
            orderBy = [{ dateOfJoining: 'asc' }, { employeeId: 'desc' }];
        }
        const [total, rows] = await Promise.all([
            prismaClient_1.prisma.employee.count({ where }),
            prismaClient_1.prisma.employee.findMany({
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
        return { items: rows, total, page, pageSize: take };
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
                    imageFileName: files.image.originalname,
                    imageData: files.image.buffer,
                    documentMimeType: files.document.mimetype,
                    documentFileName: files.document.originalname,
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
            const updateData = { updatedBy: 1 };
            if (employeeData.firstName != null)
                updateData.firstName = employeeData.firstName;
            if (employeeData.lastName != null)
                updateData.lastName = employeeData.lastName;
            if (employeeData.email != null)
                updateData.email = String(employeeData.email).trim().toLowerCase();
            if (employeeData.department != null)
                updateData.department = employeeData.department;
            if (employeeData.position != null)
                updateData.position = employeeData.position;
            if (employeeData.salary != null)
                updateData.salary = employeeData.salary;
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
            if (employeeData.address != null)
                updateData.address = employeeData.address;
            if (typeof employeeData.isActive === 'boolean')
                updateData.isActive = employeeData.isActive;
            if (phone !== undefined)
                updateData.phoneNumber = phone;
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
