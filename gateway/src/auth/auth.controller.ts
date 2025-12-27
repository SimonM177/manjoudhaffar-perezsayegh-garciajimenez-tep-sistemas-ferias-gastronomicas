import { Body, ClassSerializerInterceptor, Controller, HttpCode, Post, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { RegisterDTO } from "./dto/register.dto";
import { AuthService } from "./auth.service";
import { LoginDTO } from "./dto/login.dto";

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @UsePipes(new ValidationPipe( {whitelist: true, forbidNonWhitelisted: true }))
    register(@Body() dto: RegisterDTO) {
        return this.authService.register(dto);
    }

    @Post('login')
    @HttpCode(200)
    @UsePipes(new ValidationPipe( {whitelist: true, forbidNonWhitelisted: true }))
    async login(@Body() dto: LoginDTO) {
        return this.authService.login(dto);
    }
}