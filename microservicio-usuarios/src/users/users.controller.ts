import { Controller } from "@nestjs/common";
import { UsersService } from "./users.service";
import { LogService } from "src/logs/logs.service";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { plainToInstance } from "class-transformer";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { validate } from "class-validator";

@Controller()
export class UsersController {
    constructor(
        private usersService: UsersService,
        private logService: LogService,
    ) {}

    @MessagePattern('users_update_profile')
    async updateProfile(@Payload () data: {userId: string; fullname?: string; email?: string; password?: string}) {
        try {
            const dto = plainToInstance(UpdateProfileDto, {
                fullname: data.fullname,
                email: data.email,
                password: data.password
            });

            const errors = await validate(dto);
            if (errors.length > 0) {
              const errorMessage = errors.map(err => Object.values(err.constraints || {})).flat().join(', ');
              throw new Error(`Validación fallida: ${errorMessage}`);
            }
            const user = await this.usersService.updateProfile(data.userId, dto);
            await this.logService.createLog('users_update_profile', 'RPC', data.userId, 200, 'Perfil actualizado correctamente');
            return { status: 'success', data: user };
        } catch (error) {
            await this.logService.createLog('users_update_profile', 'RPC', data.userId, 400, error.message);
            return { status: 'error', message: error.message, statusCode: 400 };
        }
    }

    @MessagePattern('users_get_profile')
    async getProfile(@Payload () data: {userId: string}) {
        try {
            const user = await this.usersService.findById(data.userId);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            await this.logService.createLog('users_get_profile', 'RPC', data.userId, 200, 'Perfil obtenido correctamente');
            return { status: 'success', data: user };
        } catch (error) {
            await this.logService.createLog('users_get_profile', 'RPC', data?.userId, 404, error.message);
            return { status: 'error', message: error.message, statusCode: 404 };
        }
    }
}