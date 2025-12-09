import { IsString, IsNumber, IsOptional, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsNumber()
  @IsOptional()
  parentId?: number;
}
