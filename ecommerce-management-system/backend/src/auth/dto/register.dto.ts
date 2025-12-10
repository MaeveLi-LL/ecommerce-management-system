import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// 注册时提交的数据格式
export class RegisterDto {
  @ApiProperty({ description: '用户名', example: 'testuser', minLength: 3 })
  @IsString()
  @MinLength(3)
  username: string; // 用户名至少3个字符

  @ApiProperty({ description: '邮箱地址', example: 'test@example.com' })
  @IsEmail()
  email: string; // 必须是有效的邮箱格式

  @ApiProperty({ description: '密码', example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string; // 密码至少6个字符
}
