import { IsString } from 'class-validator';

// 登录时提交的数据格式
export class LoginDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}
