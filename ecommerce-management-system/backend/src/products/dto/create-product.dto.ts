import { IsString, IsNumber, IsOptional, Min, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: '商品名称', example: 'iPhone 15' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiPropertyOptional({ description: '商品描述', example: '最新款苹果手机' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: '商品价格', example: 5999.99, minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: '库存数量', example: 100, minimum: 0 })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiPropertyOptional({ description: '分类ID', example: 1 })
  @IsNumber()
  @IsOptional()
  categoryId?: number;
}


