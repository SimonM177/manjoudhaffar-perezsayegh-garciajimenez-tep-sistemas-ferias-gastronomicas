import { Body, Controller, Get, Patch, Request, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { UsersService } from "./users.service";
import { AuthGuard } from "@nestjs/passport";

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Get('profile')
    @UseGuards(AuthGuard('jwt'))
    async getProfile(@Request() req) {
        const userId = req.user.userId;
        return this.usersService.getProfile(userId);
    }

    @Patch('profile')
    @UseGuards(AuthGuard('jwt'))
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async updateProfile(@Request() req, @Body() dto) {
        const userId = req.user.userId;
        return this.usersService.updateProfile(userId, dto);
    }
}