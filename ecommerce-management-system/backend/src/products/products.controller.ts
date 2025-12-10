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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('商品管理')
@ApiBearerAuth('JWT-auth')
@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiOperation({ summary: '创建商品' })
  @ApiResponse({ status: 201, description: '商品创建成功' })
  @ApiResponse({ status: 401, description: '未授权，需要登录' })
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

  @ApiOperation({ summary: '获取商品列表' })
  @ApiResponse({ status: 200, description: '返回当前用户的商品列表' })
  @ApiResponse({ status: 401, description: '未授权，需要登录' })
  @Get()
  findAll(@Request() req) {
    return this.productsService.findAll(req.user.userId);
  }

  @ApiOperation({ summary: '获取商品详情' })
  @ApiParam({ name: 'id', description: '商品ID' })
  @ApiResponse({ status: 200, description: '返回商品详情' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @ApiOperation({ summary: '更新商品信息' })
  @ApiParam({ name: 'id', description: '商品ID' })
  @ApiResponse({ status: 200, description: '商品更新成功' })
  @ApiResponse({ status: 404, description: '商品不存在' })
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

  @ApiOperation({ summary: '删除商品' })
  @ApiParam({ name: 'id', description: '商品ID' })
  @ApiResponse({ status: 200, description: '商品删除成功' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.productsService.remove(+id, req.user.userId);
  }
}
