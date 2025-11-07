import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, UseInterceptors, UploadedFiles, BadRequestException, InternalServerErrorException, UseGuards } from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'coverImage', maxCount: 1 },
    { name: 'bookPdf', maxCount: 1 },
  ]))
  create(
    @Body() createBookDto: CreateBookDto,
    @UploadedFiles() files: { coverImage?: Express.Multer.File[], bookPdf?: Express.Multer.File[] }
  ) {
    const { coverImage, bookPdf } = files;

    if (!coverImage || !coverImage[0] || !bookPdf || !bookPdf[0]) throw new BadRequestException('Faltan archivos (se requiere coverImage y bookPdf)');

    return this.booksService.create(createBookDto, coverImage[0], bookPdf[0]);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.booksService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.booksService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UseInterceptors(FileFieldsInterceptor(
    [
      { name: 'coverImage', maxCount: 1 },
      { name: 'bookPdf', maxCount: 1 },
    ],
    {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = process.env.UPLOADS_DIR;
          if (!uploadPath) {
            return cb(new InternalServerErrorException('Directorio de subida no configurado'), "");
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, `${file.fieldname}-${uniqueSuffix}-${file.originalname}`);
        }
      })
    }
  ))
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateBookDto: UpdateBookDto,
    @UploadedFiles() files: { coverImage?: Express.Multer.File[], bookPdf?: Express.Multer.File[] }
  ) {
    return this.booksService.update(id, updateBookDto, files);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.booksService.remove(id);
  }
}
