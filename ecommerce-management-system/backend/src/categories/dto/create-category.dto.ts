import { IsString, IsNumber, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ description: '分类名称', example: '电子产品' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiPropertyOptional({ description: '父分类ID（用于创建子分类）', example: 1 })
  @IsNumber()
  @IsOptional()
  parentId?: number;
}


