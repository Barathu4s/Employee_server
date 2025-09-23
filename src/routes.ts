/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from '@tsoa/runtime';
import {  fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { EmployeeController } from './controllers/EmployeeController';
import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from 'express';
const multer = require('multer');




// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "EmployeeResponse": {
        "dataType": "refObject",
        "properties": {
            "firstName": {"dataType":"string","required":true},
            "lastName": {"dataType":"string","required":true},
            "email": {"dataType":"string","required":true},
            "phoneNumber": {"dataType":"string","required":true},
            "department": {"dataType":"string","required":true},
            "position": {"dataType":"string","required":true},
            "salary": {"dataType":"double","required":true},
            "dateOfJoining": {"dataType":"string","required":true},
            "address": {"dataType":"string","required":true},
            "isActive": {"dataType":"boolean"},
            "employeeId": {"dataType":"double","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "isDeleted": {"dataType":"boolean","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new ExpressTemplateService(models, {"noImplicitAdditionalProperties":"throw-on-extras","bodyCoercion":true});

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa




export function RegisterRoutes(app: Router,opts?:{multer?:ReturnType<typeof multer>}) {

    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################

    const upload = opts?.multer ||  multer({"limits":{"fileSize":8388608}});

    
        const argsEmployeeController_listEmployees: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/api/employees',
            ...(fetchMiddlewares<RequestHandler>(EmployeeController)),
            ...(fetchMiddlewares<RequestHandler>(EmployeeController.prototype.listEmployees)),

            async function EmployeeController_listEmployees(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEmployeeController_listEmployees, request, response });

                const controller = new EmployeeController();

              await templateService.apiHandler({
                methodName: 'listEmployees',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsEmployeeController_checkEmail: Record<string, TsoaRoute.ParameterSchema> = {
                email: {"in":"query","name":"email","required":true,"dataType":"string"},
                excludeId: {"in":"query","name":"excludeId","dataType":"double"},
        };
        app.get('/api/employees/check-email',
            ...(fetchMiddlewares<RequestHandler>(EmployeeController)),
            ...(fetchMiddlewares<RequestHandler>(EmployeeController.prototype.checkEmail)),

            async function EmployeeController_checkEmail(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEmployeeController_checkEmail, request, response });

                const controller = new EmployeeController();

              await templateService.apiHandler({
                methodName: 'checkEmail',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsEmployeeController_createEmployee: Record<string, TsoaRoute.ParameterSchema> = {
                firstName: {"in":"formData","name":"firstName","required":true,"dataType":"string"},
                lastName: {"in":"formData","name":"lastName","required":true,"dataType":"string"},
                email: {"in":"formData","name":"email","required":true,"dataType":"string"},
                phoneNumber: {"in":"formData","name":"phoneNumber","required":true,"dataType":"string"},
                department: {"in":"formData","name":"department","required":true,"dataType":"string"},
                position: {"in":"formData","name":"position","required":true,"dataType":"string"},
                salary: {"in":"formData","name":"salary","required":true,"dataType":"string"},
                dateOfJoining: {"in":"formData","name":"dateOfJoining","required":true,"dataType":"string"},
                address: {"in":"formData","name":"address","required":true,"dataType":"string"},
                isActive: {"in":"formData","name":"isActive","required":true,"dataType":"string"},
                image: {"in":"formData","name":"image","required":true,"dataType":"file"},
                document: {"in":"formData","name":"document","required":true,"dataType":"file"},
        };
        app.post('/api/employees',
            upload.fields([
                {
                    name: "image",
                    maxCount: 1
                },
                {
                    name: "document",
                    maxCount: 1
                }
            ]),
            ...(fetchMiddlewares<RequestHandler>(EmployeeController)),
            ...(fetchMiddlewares<RequestHandler>(EmployeeController.prototype.createEmployee)),

            async function EmployeeController_createEmployee(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEmployeeController_createEmployee, request, response });

                const controller = new EmployeeController();

              await templateService.apiHandler({
                methodName: 'createEmployee',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsEmployeeController_updateEmployee: Record<string, TsoaRoute.ParameterSchema> = {
                employeeId: {"in":"path","name":"employeeId","required":true,"dataType":"double"},
                firstName: {"in":"formData","name":"firstName","required":true,"dataType":"string"},
                lastName: {"in":"formData","name":"lastName","required":true,"dataType":"string"},
                email: {"in":"formData","name":"email","required":true,"dataType":"string"},
                department: {"in":"formData","name":"department","required":true,"dataType":"string"},
                position: {"in":"formData","name":"position","required":true,"dataType":"string"},
                salary: {"in":"formData","name":"salary","required":true,"dataType":"string"},
                dateOfJoining: {"in":"formData","name":"dateOfJoining","required":true,"dataType":"string"},
                address: {"in":"formData","name":"address","required":true,"dataType":"string"},
                isActive: {"in":"formData","name":"isActive","required":true,"dataType":"string"},
                phoneNumber: {"in":"formData","name":"phoneNumber","dataType":"string"},
                image: {"in":"formData","name":"image","dataType":"file"},
                document: {"in":"formData","name":"document","dataType":"file"},
        };
        app.put('/api/employees/:employeeId',
            upload.fields([
                {
                    name: "image",
                    maxCount: 1
                },
                {
                    name: "document",
                    maxCount: 1
                }
            ]),
            ...(fetchMiddlewares<RequestHandler>(EmployeeController)),
            ...(fetchMiddlewares<RequestHandler>(EmployeeController.prototype.updateEmployee)),

            async function EmployeeController_updateEmployee(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEmployeeController_updateEmployee, request, response });

                const controller = new EmployeeController();

              await templateService.apiHandler({
                methodName: 'updateEmployee',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsEmployeeController_deleteEmployee: Record<string, TsoaRoute.ParameterSchema> = {
                employeeId: {"in":"path","name":"employeeId","required":true,"dataType":"double"},
        };
        app.delete('/api/employees/:employeeId',
            ...(fetchMiddlewares<RequestHandler>(EmployeeController)),
            ...(fetchMiddlewares<RequestHandler>(EmployeeController.prototype.deleteEmployee)),

            async function EmployeeController_deleteEmployee(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEmployeeController_deleteEmployee, request, response });

                const controller = new EmployeeController();

              await templateService.apiHandler({
                methodName: 'deleteEmployee',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
