import { InternalServerErrorException, Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';

@Module({
  controllers: [BooksController],
  providers: [BooksService],
  imports: [
    TypeOrmModule.forFeature([Book]),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {

        const uploadsDir = configService.get<string>('UPLOADS_DIR');
        if (!uploadsDir) {
          throw new InternalServerErrorException('FATAL ERROR: UPLOADS_DIR no está definido en .env');
        }

        return {
          storage: diskStorage({
            destination: uploadsDir,
            filename: (req, file, cb) => {
              const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
              cb(null, `${file.fieldname}-${uniqueSuffix}-${file.originalname}`);
            }
          })
        };
      },
    }),
  ]
})
export class BooksModule { }
