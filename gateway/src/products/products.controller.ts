import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from "@nestjs/common";
import { ProductsService } from "./products.service";
import { AuthGuard } from "@nestjs/passport";

@Controller('products')
export class ProductsController {
    constructor(
        private productsService: ProductsService
    ) {}

    @Post()
    @UseGuards(AuthGuard('jwt'))
    async create(@Request() req, @Body() dto: any) {
        const userId = req.user.userId;
        const {stallId, ...productData} = dto;
        return this.productsService.createProduct(userId, stallId, productData);
    }

    @Get('stall/:stallId')
    @UseGuards(AuthGuard('jwt'))
    async findByStall(@Request() req, @Param('stallId') stallId: string) {
      const userId = req.user.userId;
      return this.productsService.findProductsByStall(userId, stallId);
    }

    @Get(':id')
    @UseGuards(AuthGuard('jwt'))
    async findOne(@Request() req, @Param('id') id: string) {
      const userId = req.user.userId;
      return this.productsService.findOneProduct(userId, id);
    }
  
    @Put(':id')
    @UseGuards(AuthGuard('jwt'))
    async update(@Request() req, @Param('id') id: string, @Body() dto: any) {
      const userId = req.user.userId;
      return this.productsService.updateProduct(userId, id, dto);
    }
  
    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    async remove(@Request() req, @Param('id') id: string) {
      const userId = req.user.userId;
      return this.productsService.removeProduct(userId, id);
    }
}