import { JwtService } from "@nestjs/jwt";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
export declare class AuthService {
    private userRepository;
    private jwtService;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
    private validarContraseña;
    register(email: string, password: string, fullname: string, role: string): Promise<{
        message: string;
    }>;
    login(email: string, password: string): Promise<{
        access_token: string;
        user: any;
    }>;
    validarUsuarioRol(userId: string, rolEsperado: string): Promise<{
        valid: boolean;
        user?: any;
    }>;
    findUserById(id: string): Promise<User | null>;
}
