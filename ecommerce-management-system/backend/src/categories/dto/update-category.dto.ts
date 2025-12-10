import { IsString, IsNumber, IsOptional, MinLength, ValidateIf } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiPropertyOptional({ description: '分类名称', example: '电子产品' })
  @IsString()
  @MinLength(1)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: '父分类ID（设置为null可移除父分类）', example: 1, nullable: true })
  @ValidateIf((o) => o.parentId !== undefined)
  @IsNumber()
  @IsOptional()
  parentId?: number | null;
}


