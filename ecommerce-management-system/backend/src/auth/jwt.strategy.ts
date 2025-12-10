import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'your-secret-key-change-in-production', // 正式环境记得改成环境变量
    });
  }

  // 从token中提取用户信息
  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }
}
