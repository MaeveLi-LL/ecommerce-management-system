import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  // 测试接口，访问根路径时返回
  getHello(): string {
    return 'Hello World!';
  }
}


