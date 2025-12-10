import { IsEmail, IsString, MinLength } from 'class-validator';

// 注册时提交的数据格式
export class RegisterDto {
  @IsString()
  @MinLength(3)
  username: string; // 用户名至少3个字符

  @IsEmail()
  email: string; // 必须是有效的邮箱格式

  @IsString()
  @MinLength(6)
  password: string; // 密码至少6个字符
}
