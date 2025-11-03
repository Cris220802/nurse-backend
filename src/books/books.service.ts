import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class BooksService {
  private readonly apiHost: string;
  private readonly uploadsDir: string;

  private readonly logger = new Logger('BooksService');

  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    private readonly configService: ConfigService,
  ) {
    const host = this.configService.get<string>('API_HOST');
    const uploads = this.configService.get<string>('UPLOADS_DIR'); // <-- Añade esto

    if (!host || !uploads) { // <-- Verifica ambas
      throw new Error('FATAL ERROR: API_HOST o UPLOADS_DIR no están definidos en .env');
    }
    this.apiHost = host;
    this.uploadsDir = uploads; // <-- Asigna
  }

  async create(createBookDto: CreateBookDto, coverImage: Express.Multer.File, bookPdf: Express.Multer.File) {
    if (!coverImage || !bookPdf) {
      throw new Error('Faltan archivos de portada o del libro.');
    }

    const newBook = this.bookRepository.create({
      ...createBookDto,
      coverImage: `${this.apiHost}/uploads/${coverImage.filename}`,
      bookFile: `${this.apiHost}/uploads/${bookPdf.filename}`,
    });

    try {
      await this.bookRepository.save(newBook);
      return newBook;
    } catch (error) {
      this.handleDBExceptions(error);
    }

  }

  async findAll(paginationDto: PaginationDto): Promise<Book[]> {
    const { limit = 10, offset = 0 } = paginationDto;

    const books = await this.bookRepository.find({
      take: limit,
      skip: offset,
    })

    return books;
  }

  async findOne(id: string): Promise<Book> {
    const book = await this.bookRepository.findOneBy({ id })

    if (!book) throw new NotFoundException(`El libro con id: ${id}, no se encuentra en la base de datos`);

    return book;
  }

  async update(
    id: string,
    updateBookDto: UpdateBookDto,
    files: { coverImage?: Express.Multer.File[], bookPdf?: Express.Multer.File[] }
  ) {
    const book = await this.findOne(id);

    if (files.coverImage && files.coverImage[0]) {
      await this._deleteFile(book.coverImage);
      book.coverImage = `${this.apiHost}/uploads/${files.coverImage[0].filename}`;
    }

    if (files.bookPdf && files.bookPdf[0]) {
      await this._deleteFile(book.bookFile);
      book.bookFile = `${this.apiHost}/uploads/${files.bookPdf[0].filename}`;
    }
    Object.assign(book, updateBookDto);

    return this.bookRepository.save(book);
  }

  async remove(id: string) {
    const book = await this.findOne(id);

    await this._deleteFile(book.coverImage);
    await this._deleteFile(book.bookFile);

    await this.bookRepository.remove(book);
    return { message: `Libro con ID "${id}" y sus archivos eliminados.` };
  }

  private async _deleteFile(fileUrl: string) {
    if (!fileUrl) return; // No hacer nada si la URL está vacía

    try {
      const filename = fileUrl.split('/uploads/')[1];
      if (!filename) {
        console.error(`URL de archivo no válida, no se pudo extraer el nombre: ${fileUrl}`);
        return;
      }
      const filePath = join(this.uploadsDir, filename);

      await fs.unlink(filePath);

    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error(`Error al borrar el archivo ${fileUrl}:`, error);
      }
    }
  }

  private handleDBExceptions(error: any): never {
    this.logger.error(error);

    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    throw new InternalServerErrorException('Unexpected error creating book. Check server logs.');
  }
}
