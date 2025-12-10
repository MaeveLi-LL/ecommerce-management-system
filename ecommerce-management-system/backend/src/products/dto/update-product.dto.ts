import { IsString, IsNumber, IsOptional, Min, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiPropertyOptional({ description: '商品名称', example: 'iPhone 15 Pro' })
  @IsString()
  @MinLength(1)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: '商品描述', example: '最新款苹果手机 Pro 版本' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '商品价格', example: 7999.99, minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ description: '库存数量', example: 50, minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;

  @ApiPropertyOptional({ description: '分类ID', example: 1 })
  @IsNumber()
  @IsOptional()
  categoryId?: number;
}


