import { Controller, Get, HttpException, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrganizerService } from './organizer.service';

@Controller('organizer')
export class OrganizerController {
  constructor(private readonly organizerService: OrganizerService) {}

  @Get('overview')
  @UseGuards(AuthGuard('jwt'))
  async overview(
    @Request() req,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('stallId') stallId?: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
  ) {
    const userId = req.user?.userId;
    if (!userId) throw new HttpException('JWT inválido', 401);
    return this.organizerService.overview(userId, { from, to, stallId, status, category });
  }

  @Get('stats/sales-by-stall')
  @UseGuards(AuthGuard('jwt'))
  async salesByStall(
    @Request() req,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('stallId') stallId?: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
  ) {
    const userId = req.user?.userId;
    if (!userId) throw new HttpException('JWT inválido', 401);
    return this.organizerService.salesByStall(userId, { from, to, stallId, status, category });
  }

  @Get('stats/top-product')
  @UseGuards(AuthGuard('jwt'))
  async topProduct(
    @Request() req,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('stallId') stallId?: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
  ) {
    const userId = req.user?.userId;
    if (!userId) throw new HttpException('JWT inválido', 401);
    return this.organizerService.topProduct(userId, { from, to, stallId, status, category });
  }

  @Get('stats/volume-by-day')
  @UseGuards(AuthGuard('jwt'))
  async volumeByDay(
    @Request() req,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('stallId') stallId?: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
  ) {
    const userId = req.user?.userId;
    if (!userId) throw new HttpException('JWT inválido', 401);
    return this.organizerService.volumeByDay(userId, { from, to, stallId, status, category });
  }

  @Get('stats/completed-count')
  @UseGuards(AuthGuard('jwt'))
  async completedCount(
    @Request() req,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('stallId') stallId?: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
  ) {
    const userId = req.user?.userId;
    if (!userId) throw new HttpException('JWT inválido', 401);
    return this.organizerService.completedCount(userId, { from, to, stallId, status, category });
  }
}
