import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // 创建商品
  @Post()
  create(@Request() req, @Body() createProductDto: CreateProductDto) {
    return this.productsService.create(
      req.user.userId,
      createProductDto.name,
      createProductDto.description || '',
      createProductDto.price,
      createProductDto.stock,
      createProductDto.categoryId,
    );
  }

  // 获取所有商品
  @Get()
  findAll(@Request() req) {
    // 只返回当前用户的商品
    return this.productsService.findAll(req.user.userId);
  }

  // 根据ID获取商品
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  // 更新商品
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(
      +id,
      req.user.userId,
      updateProductDto.name,
      updateProductDto.description,
      updateProductDto.price,
      updateProductDto.stock,
      updateProductDto.categoryId,
    );
  }

  // 删除商品
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.productsService.remove(+id, req.user.userId);
  }
}
