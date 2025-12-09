import { IsString, IsNumber, IsOptional, MinLength } from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  parentId?: number;
}
