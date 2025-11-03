import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { BooksModule } from './books/books.module';
import { NandasModule } from './nandas/nandas.module';
import { NicsModule } from './nics/nics.module';
import { NocsModule } from './nocs/nocs.module';
import { EspecialidadesModule } from './especialidades/especialidades.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { join } from 'path';
import { diskStorage } from 'multer';
import { MulterModule } from '@nestjs/platform-express';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT!,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true,
    }),
    ServeStaticModule.forRootAsync({
      imports: [ConfigModule], // Importa ConfigModule aquí
      inject: [ConfigService],  // Inyéctalo
      useFactory: (configService: ConfigService) => {
        const uploadsDir = configService.get<string>('UPLOADS_DIR');
        if (!uploadsDir) {
          throw new Error('FATAL ERROR: UPLOADS_DIR no está definido en .env');
        }
        return [{
          rootPath: join(__dirname, '..', uploadsDir),
          serveRoot: '/uploads',
        }];
      },
    }),
    BooksModule,
    NandasModule,
    NicsModule,
    NocsModule,
    EspecialidadesModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
