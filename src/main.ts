import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json } from 'express';
import { map } from 'rxjs';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(json());
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.setGlobalPrefix('api/catalog/v1/', {
    exclude: ['/health', '/', '/api/catalog/docs'],
  });

  const config = new DocumentBuilder()
    .setTitle('Market 4 Test API')
    .setDescription('')
    .setVersion('0.0.1')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('/api/catalog/docs', app, document);

  // Глобальный перехватчик для обработки ответов
  app.useGlobalInterceptors({
    intercept: (context, next) => {
      return next.handle().pipe(
        map((data) => {
          // Устанавливаем заголовок Content-Type
          context
            .switchToHttp()
            .getResponse()
            .header('Content-Type', 'application/json');

          // Если данные уже являются объектом, просто возвращаем их
          if (typeof data === 'object' && data !== null) {
            return data;
          }
          // В противном случае оборачиваем данные в объект
          return { data };
        }),
      );
    },
  });

  // Глобальный middleware для обработки входящих запросов
  // app.use((req, res, next) => {
  //   if (req.headers['content-type'] !== 'application/json') {
  //     return res
  //       .status(415)
  //       .json({ error: 'Unsupported Media Type. Please send JSON.' });
  //   }
  //   next();
  // });
  const port = configService.get<number>('PORT') || 3020;
  await app.listen(port);
}

bootstrap();
