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

  const allowedOrigins = [
    // Tu frontend en Render
    'https://nurse-frontend-9f9g.onrender.com', 
    
    // desarrollo local
    'http://localhost:5173', 
    
    // Orígen para desarrollo móvil 
    'http://localhost',
  ];

  app.enableCors({
    origin: 'http://localhost:5173', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, 
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
