import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 允许前端跨域访问
  app.enableCors();
  
  // 全局数据验证
  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(3000);
  console.log('后端服务已启动，运行在 http://localhost:3000');
}
bootstrap();


