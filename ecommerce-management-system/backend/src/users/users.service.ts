import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // 创建用户
  async createUser(username: string, email: string, password: string) {
    // 先检查用户名或邮箱是否已经被注册了
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      throw new ConflictException('用户名或邮箱已存在');
    }

    // 密码加密存储，不能存明文
    const hashedPassword = await bcrypt.hash(password, 10);

    // 保存到数据库
    const user = await this.prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    // 返回时去掉密码字段，安全起见
    const { password: _, ...result } = user;
    return result;
  }

  // 根据用户名找用户
  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  // 验证用户名和密码是否正确
  async validateUser(username: string, password: string) {
    const user = await this.findByUsername(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      // 验证通过，返回用户信息（不含密码）
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }
}
