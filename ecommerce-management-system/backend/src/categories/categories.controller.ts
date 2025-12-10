import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
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
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(
      createCategoryDto.name,
      createCategoryDto.parentId,
    );
  }

  @ApiOperation({ summary: '获取分类列表' })
  @ApiResponse({ status: 200, description: '返回所有分类列表' })
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @ApiOperation({ summary: '获取分类详情' })
  @ApiParam({ name: 'id', description: '分类ID' })
  @ApiResponse({ status: 200, description: '返回分类详情' })
  @ApiResponse({ status: 404, description: '分类不存在' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(+id);
  }

  @ApiOperation({ summary: '更新分类信息' })
  @ApiParam({ name: 'id', description: '分类ID' })
  @ApiResponse({ status: 200, description: '分类更新成功' })
  @ApiResponse({ status: 404, description: '分类不存在' })
  @ApiResponse({ status: 409, description: '分类名称已存在' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(
      +id,
      updateCategoryDto.name,
      updateCategoryDto.parentId === null ? null : updateCategoryDto.parentId,
    );
  }

  @ApiOperation({ summary: '删除分类' })
  @ApiParam({ name: 'id', description: '分类ID' })
  @ApiResponse({ status: 200, description: '分类删除成功' })
  @ApiResponse({ status: 404, description: '分类不存在' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(+id);
  }
}


