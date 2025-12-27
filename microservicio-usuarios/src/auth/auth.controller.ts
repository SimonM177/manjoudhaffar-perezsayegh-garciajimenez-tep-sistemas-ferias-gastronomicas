import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { LogService } from 'src/logs/logs.service';

/* @Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @MessagePattern('auth_register')
  async register(@Payload() data: { email: string; password: string; fullname: string; role: string }) {
    return this.authService.register(data.email, data.password, data.fullname, data.role);
  }

  @MessagePattern('auth_login')
  async login(@Payload() data: { email: string; password: string }) {
    return this.authService.login(data.email, data.password);
  }

  @MessagePattern('auth.validar_usuario')
  async validarUsuario(@Payload() data: { userId: string; role: string }) {
    return this.authService.validarUsuarioRol(data.userId, data.role);
  }
} */

@Controller()
export class AuthController {
  constructor(private authService: AuthService, private readonly logService: LogService) {}

  @MessagePattern('auth_register')
  async register(@Payload() data: { email: string; password: string; fullname: string; role: string }) {
    try {
      const result = await this.authService.register(data.email, data.password, data.fullname, data.role);
      await this.logService.createLog('auth_register', 'RPC', null, 201, 'Usuario registrado exitosamente');
      return { status: 'success', data: result };
    } catch (error) {
      // Extrae el mensaje y código de error de forma segura
      const message = error.message || 'Error desconocido';
      const statusCode = error.getStatus?.() || 400;
      await this.logService.createLog('auth_register', 'RPC', null, statusCode, message);
      return { status: 'error', message, statusCode };
    }
  }

  @MessagePattern('auth_login')
  async login(@Payload() data: { email: string; password: string }) {
    try {
      const result = await this.authService.login(data.email, data.password);
      await this.logService.createLog('auth_login', 'RPC', result.user.id, 200, 'Inicio de sesión exitoso');
      return { status: 'success', data: result };
    } catch (error) {
      const message = error.message || 'Credenciales incorrectas';
      const statusCode = error.getStatus?.() || 401;
      await this.logService.createLog('auth_login', 'RPC', null, statusCode, message);
      return { status: 'error', message, statusCode };
    }
  }

  @MessagePattern('auth_validate_user')
  async validarUsuario(@Payload() data: { userId: string; role: string }) {
    try {
      const result = await this.authService.validarUsuarioRol(data.userId, data.role);

      if(!result.valid) {
        await this.logService.createLog('auth_validate_user', 'RPC', data.userId, 403, 'Rol no autorizado para la acción');
        return { status: 'error', message: 'Rol no autorizado para la acción', statusCode: 403 };
      }

      await this.logService.createLog('auth_validate_user', 'RPC', data.userId, 200, 'Validación de usuario exitosa');
      return { status: 'success', data: result };
    } catch (error) {
      await this.logService.createLog('auth_validate_user', 'RPC', data.userId, 500, 'Error al validar usuario');
      return { status: 'error', message: 'Error al validar usuario', statusCode: 500 };
    }
  }
}