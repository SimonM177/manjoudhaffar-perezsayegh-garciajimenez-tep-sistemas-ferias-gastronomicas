import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import * as bcrypt from 'bcrypt';
import { jwtConstants } from "./auth.constants";

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
    ){}

    private validarContraseña(contraseña: string): boolean {
        if (contraseña.length < 8) return false; // Verificar si la contraseña tiene 8 carácteres
        const tieneNumero = /\d/.test(contraseña); // Verificar que la contraseña tenga al menos 1 número
        if (!tieneNumero) return false;
        const tieneEspecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(contraseña); // Verificar que la contraseña tenga al menos un carácter especial
        if (!tieneEspecial) return false;
        return true; // Si cumple con: un número incluido + un carácter especial + contraseña de 8 carácteres de longitud = true
    }    

    async register(email: string, password: string, fullname: string, role: string): Promise<{message: string}> {
        
        const rolAlt = role.trim().toLowerCase();
        // Verificar el rol que se esta ingresando
        const rolesValidos: string[] = ['cliente', 'emprendedor', 'organizador'];
        if(!rolesValidos.includes(rolAlt)) {
            throw new BadRequestException('Rol no soportado por el sistema.');
        }

        // Verificar si el correo electronico ya esta registrado
        const existingUser = await this.userRepository.findOne({where: {email}});
        if (existingUser) {
            throw new BadRequestException('El correo ya esta en uso');
        }

        // Verificar que la contraseña cumpla con los estándares de seguridad del sistema
        if(!this.validarContraseña(password)) {
            throw new BadRequestException('La contraseña no cumple con las medidas de seguridad del sistema. Recuerde que es: 8 carácteres de longitud + 1 carácter especial + 1 número incluido.');
        }

        // hashear el password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = this.userRepository.create({ 
            email,
            password_hash: hashedPassword,
            fullname,
            role: rolAlt as any,
        });

        await this.userRepository.save(user);
        return { message: "Usuario registrado exitosamente."}
    }
    
    async login(email: string, password: string): Promise<{ access_token: string; user: any}> {
        const user = await this.userRepository.findOne({where: {email}});
        // Validar la existencia del usuario
        if (!user) {
            throw new UnauthorizedException('No existe un usuario registrado a ese correo y/o contraseña.');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('No existe un usuario registrado a ese correo y/o contraseña.');
        }

        // Payload del JWT
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        }

        return {
            access_token: this.jwtService.sign(payload, {
                secret: jwtConstants.secret,
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

    async validarUsuarioRol(userId: string, rolEsperado: string): Promise<{ valid: boolean; user?: any }> {
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
    
    // Obtener el usuario por id
    async findUserById(id: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { id } });
    }
    
}