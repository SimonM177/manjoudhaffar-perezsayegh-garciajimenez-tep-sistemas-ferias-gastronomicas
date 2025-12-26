import { AuthService } from './auth.service';
import { LogService } from 'src/logs/logs.service';
export declare class AuthController {
    private authService;
    private readonly logService;
    constructor(authService: AuthService, logService: LogService);
    register(data: {
        email: string;
        password: string;
        fullname: string;
        role: string;
    }): Promise<{
        status: string;
        data: {
            message: string;
        };
        message?: undefined;
        statusCode?: undefined;
    } | {
        status: string;
        message: any;
        statusCode: any;
        data?: undefined;
    }>;
    login(data: {
        email: string;
        password: string;
    }): Promise<{
        status: string;
        data: {
            access_token: string;
            user: any;
        };
        message?: undefined;
        statusCode?: undefined;
    } | {
        status: string;
        message: any;
        statusCode: any;
        data?: undefined;
    }>;
    validarUsuario(data: {
        userId: string;
        role: string;
    }): Promise<{
        status: string;
        data: {
            valid: boolean;
            user?: any;
        };
        message?: undefined;
        statusCode?: undefined;
    } | {
        status: string;
        message: string;
        statusCode: number;
        data?: undefined;
    }>;
}
