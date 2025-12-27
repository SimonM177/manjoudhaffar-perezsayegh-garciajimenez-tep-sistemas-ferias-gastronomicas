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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const auth_service_1 = require("./auth.service");
const logs_service_1 = require("../logs/logs.service");
let AuthController = class AuthController {
    authService;
    logService;
    constructor(authService, logService) {
        this.authService = authService;
        this.logService = logService;
    }
    async register(data) {
        try {
            const result = await this.authService.register(data.email, data.password, data.fullname, data.role);
            await this.logService.createLog('auth_register', 'RPC', null, 201, 'Usuario registrado exitosamente');
            return { status: 'success', data: result };
        }
        catch (error) {
            const message = error.message || 'Error desconocido';
            const statusCode = error.getStatus?.() || 400;
            await this.logService.createLog('auth_register', 'RPC', null, statusCode, message);
            return { status: 'error', message, statusCode };
        }
    }
    async login(data) {
        try {
            const result = await this.authService.login(data.email, data.password);
            await this.logService.createLog('auth_login', 'RPC', result.user.id, 200, 'Inicio de sesión exitoso');
            return { status: 'success', data: result };
        }
        catch (error) {
            const message = error.message || 'Credenciales incorrectas';
            const statusCode = error.getStatus?.() || 401;
            await this.logService.createLog('auth_login', 'RPC', null, statusCode, message);
            return { status: 'error', message, statusCode };
        }
    }
    async validarUsuario(data) {
        try {
            const result = await this.authService.validarUsuarioRol(data.userId, data.role);
            if (!result.valid) {
                await this.logService.createLog('auth_validate_user', 'RPC', data.userId, 403, 'Rol no autorizado para la acción');
                return { status: 'error', message: 'Rol no autorizado para la acción', statusCode: 403 };
            }
            await this.logService.createLog('auth_validate_user', 'RPC', data.userId, 200, 'Validación de usuario exitosa');
            return { status: 'success', data: result };
        }
        catch (error) {
            await this.logService.createLog('auth_validate_user', 'RPC', data.userId, 500, 'Error al validar usuario');
            return { status: 'error', message: 'Error al validar usuario', statusCode: 500 };
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, microservices_1.MessagePattern)('auth_register'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, microservices_1.MessagePattern)('auth_login'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, microservices_1.MessagePattern)('auth_validate_user'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "validarUsuario", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService, logs_service_1.LogService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map