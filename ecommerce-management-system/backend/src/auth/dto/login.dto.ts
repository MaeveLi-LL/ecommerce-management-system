import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// 登录时提交的数据格式
export class LoginDto {
  @ApiProperty({ description: '用户名', example: 'testuser' })
  @IsString()
  username: string;

  @ApiProperty({ description: '密码', example: 'password123' })
  @IsString()
  password: string;
}
