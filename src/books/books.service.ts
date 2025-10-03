import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';


@Injectable()
export class BooksService {

  private readonly logger = new Logger('BooksService');

  constructor(

    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,

  ) { }

  async create(createBookDto: CreateBookDto): Promise<Book> {
    try {
      const book = this.bookRepository.create(createBookDto);

      await this.bookRepository.save(book);

      return book;

    } catch (error) {
      // Manejo de errores
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

  async update(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    const book = await this.bookRepository.preload({
      id,
      ...updateBookDto
    })

    if (!book) throw new NotFoundException(`El libro con id: ${id}, no se encuentra en la base de datos`)

    await this.bookRepository.save(book);

    return book;
  }

  async remove(id: string): Promise<void> {
    const deleteResult = await this.bookRepository.delete(id);

    if (deleteResult.affected === 0) {
      // Si affected es 0, significa que el libro con ese ID no fue encontrado.
      throw new NotFoundException(`El libro con id: ${id}, no se encuentra en la base de datos`);
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
