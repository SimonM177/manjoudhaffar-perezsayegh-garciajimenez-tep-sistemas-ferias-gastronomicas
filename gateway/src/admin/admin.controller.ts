import { Controller, Get, HttpException, Inject, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { USERS_SERVICE } from 'src/common/constants';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService,
    @Inject(USERS_SERVICE) private usersClient: ClientProxy,
  ) {}

  @Get('dashboard')
  @UseGuards(AuthGuard('jwt'))
  async getDashboard(
    @Request() req, // ← Agrega esto para obtener el usuario
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('stallId') stallId?: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
  ) {

    const userId = req.user.userId;
  
  // Validar que sea organizador
    const authResp = await firstValueFrom(
        this.usersClient.send('auth_validate_user', { userId, role: 'organizador' }),
    );
    if (authResp?.status !== 'success') {
        throw new HttpException('Acceso denegado: solo organizadores', 403);
    }    
    return this.adminService.getDashboard({
      startDate,
      endDate,
      stallId,
      status,
      category,
    });
  }
}