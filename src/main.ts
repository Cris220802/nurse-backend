import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      // forbidNonWhitelisted: true,
    })
  );

   // 👇 AQUÍ ESTÁ LA CONFIGURACIÓN DE CORS
  app.enableCors({
    origin: 'http://localhost:5173', // El origen de tu frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // Permite que el frontend envíe cookies si es necesario
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
