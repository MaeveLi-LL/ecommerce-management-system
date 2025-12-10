import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // 允许前端跨域访问
  app.enableCors();
  
  // 全局数据验证
  app.useGlobalPipes(new ValidationPipe());
  
  // 配置静态文件服务，用于访问上传的图片
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  
  // 配置 Swagger
  const config = new DocumentBuilder()
    .setTitle('电商商品管理系统 API')
    .setDescription('电商商品管理系统的 RESTful API 文档')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: '输入 JWT token',
        in: 'header',
      },
      'JWT-auth', // 这个名称用于在控制器中引用
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  await app.listen(3000);
  console.log('后端服务已启动，运行在 http://localhost:3000');
  console.log('Swagger API 文档地址: http://localhost:3000/api');
  console.log('静态文件服务: http://localhost:3000/uploads/');
}
bootstrap();


