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
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('分类管理')
@ApiBearerAuth('JWT-auth')
@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: '创建分类' })
  @ApiResponse({ status: 201, description: '分类创建成功' })
  @ApiResponse({ status: 409, description: '分类名称已存在' })
  @Post()
  create(@Request() req, @Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(
      req.user.userId,
      createCategoryDto.name,
      createCategoryDto.parentId,
    );
  }

  @ApiOperation({ summary: '获取分类列表' })
  @ApiResponse({ status: 200, description: '返回当前用户的分类列表' })
  @Get()
  findAll(@Request() req) {
    return this.categoriesService.findAll(req.user.userId);
  }

  @ApiOperation({ summary: '获取分类详情' })
  @ApiParam({ name: 'id', description: '分类ID' })
  @ApiResponse({ status: 200, description: '返回分类详情' })
  @ApiResponse({ status: 404, description: '分类不存在' })
  @ApiResponse({ status: 403, description: '无权访问此分类' })
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.categoriesService.findOne(+id, req.user.userId);
  }

  @ApiOperation({ summary: '更新分类信息' })
  @ApiParam({ name: 'id', description: '分类ID' })
  @ApiResponse({ status: 200, description: '分类更新成功' })
  @ApiResponse({ status: 404, description: '分类不存在' })
  @ApiResponse({ status: 403, description: '无权修改此分类' })
  @ApiResponse({ status: 409, description: '分类名称已存在' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(
      +id,
      req.user.userId,
      updateCategoryDto.name,
      updateCategoryDto.parentId === null ? null : updateCategoryDto.parentId,
    );
  }

  @ApiOperation({ summary: '删除分类' })
  @ApiParam({ name: 'id', description: '分类ID' })
  @ApiResponse({ status: 200, description: '分类删除成功' })
  @ApiResponse({ status: 404, description: '分类不存在' })
  @ApiResponse({ status: 403, description: '无权删除此分类' })
  @ApiResponse({ status: 409, description: '该分类下还有子分类或商品，无法删除' })
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.categoriesService.remove(+id, req.user.userId);
  }
}


