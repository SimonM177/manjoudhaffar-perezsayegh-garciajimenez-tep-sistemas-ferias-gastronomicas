"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const auth_constants_1 = require("./auth.constants");
let AuthService = class AuthService {
    userRepository;
    jwtService;
    constructor(userRepository, jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }
    validarContraseña(contraseña) {
        if (contraseña.length < 8)
            return false;
        const tieneNumero = /\d/.test(contraseña);
        if (!tieneNumero)
            return false;
        const tieneEspecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(contraseña);
        if (!tieneEspecial)
            return false;
        return true;
    }
    async register(email, password, fullname, role) {
        const rolAlt = role.trim().toLowerCase();
        const rolesValidos = ['cliente', 'emprendedor', 'organizador'];
        if (!rolesValidos.includes(rolAlt)) {
            throw new common_1.BadRequestException('Rol no soportado por el sistema.');
        }
        const existingUser = await this.userRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new common_1.BadRequestException('El correo ya esta en uso');
        }
        if (!this.validarContraseña(password)) {
            throw new common_1.BadRequestException('La contraseña no cumple con las medidas de seguridad del sistema. Recuerde que es: 8 carácteres de longitud + 1 carácter especial + 1 número incluido.');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.userRepository.create({
            email,
            password_hash: hashedPassword,
            fullname,
            role: rolAlt,
        });
        await this.userRepository.save(user);
        return { message: "Usuario registrado exitosamente." };
    }
    async login(email, password) {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new common_1.UnauthorizedException('No existe un usuario registrado a ese correo y/o contraseña.');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('No existe un usuario registrado a ese correo y/o contraseña.');
        }
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };
        return {
            access_token: this.jwtService.sign(payload, {
                secret: auth_constants_1.jwtConstants.secret,
                expiresIn: '1h',
            }),
            user: {
                id: user.id,
                email: user.email,
                fullname: user.fullname,
                role: user.role
            },
        };
    }
    async validarUsuarioRol(userId, rolEsperado) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            return { valid: false };
        }
        const coincide = user.role === rolEsperado;
        return {
            valid: coincide,
            user: coincide
                ? {
                    id: user.id,
                    email: user.email,
                    fullname: user.fullname,
                    role: user.role,
                }
                : undefined,
        };
    }
    async findUserById(id) {
        return this.userRepository.findOne({ where: { id } });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map