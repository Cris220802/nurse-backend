import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksModule } from './books/books.module';
import { NandasModule } from './nandas/nandas.module';
import { NicsModule } from './nics/nics.module';
import { NocsModule } from './nocs/nocs.module';
import { EspecialidadesModule } from './especialidades/especialidades.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
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
    BooksModule,
    NandasModule,
    NicsModule,
    NocsModule,
    EspecialidadesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
