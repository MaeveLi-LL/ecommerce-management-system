import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // 根路径测试接口
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}


