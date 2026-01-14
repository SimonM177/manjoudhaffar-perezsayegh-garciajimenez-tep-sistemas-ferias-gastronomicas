import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Request, UseGuards } from "@nestjs/common";
import { StallsService } from "./stalls.service";
import { AuthGuard } from "@nestjs/passport";

@Controller('stalls')
export class StallsController {
    constructor(private stallsService: StallsService) {}

    @Post()
    @UseGuards(AuthGuard('jwt'))
    async create(@Request() req, @Body() dto: any) {
        const ownerId = req.user.userId;
        return this.stallsService.createStall(ownerId, dto);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    async findAll(@Request() req) {
        const userId = req.user.userId;
        return this.stallsService.findAllStalls(userId);
    }

    @Get('active')
    async findActive() { // Endpoint público, no requiere autenticación
        return this.stallsService.findActiveStalls();
    }

    @Get(':id')
    @UseGuards(AuthGuard('jwt'))
    async findOne(@Request() req, @Param('id') id: string) {
        const userId = req.user.userId;
        return this.stallsService.findOneStall(userId, id);
    }

    @Put(':id')
    @UseGuards(AuthGuard('jwt'))
    async update(@Request() req, @Param('id') id: string, @Body() dto: any) {
        // Validar que el req.user.userId sea el dueño del puesto antes de actualizar
        const userId = req.user.userId;
        return this.stallsService.updateStall(userId, id, dto);
    }

    @Patch(':id/approve')
    @UseGuards(AuthGuard('jwt'))
    async approve(@Request() req, @Param('id') id: string) {
        const userId = req.user.userId;
        return this.stallsService.approveStall(userId, id);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    async remove(@Request() req, @Param('id') id: string) {
        // Validar que el req.user.userId sea el dueño del puesto antes de eliminar
        const userId = req.user.userId;
        return this.stallsService.removeStall(userId, id);
    }
}