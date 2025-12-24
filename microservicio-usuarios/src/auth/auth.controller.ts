import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @MessagePattern('auth.register')
  async register(@Payload() data: { email: string; password: string; fullname: string; role: string }) {
    return this.authService.register(data.email, data.password, data.fullname, data.role);
  }

  @MessagePattern('auth.login')
  async login(@Payload() data: { email: string; password: string }) {
    return this.authService.login(data.email, data.password);
  }

  @MessagePattern('auth.validar_usuario')
  async validarUsuario(@Payload() data: { userId: string; role: string }) {
    return this.authService.validarUsuarioRol(data.userId, data.role);
  }
}