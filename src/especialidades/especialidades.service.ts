import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateEspecialidadDto } from './dto/create-especialidad.dto';
import { UpdateEspecialidadeDto } from './dto/update-especialidad.dto';
import { Especialidad } from './entities/especialidad.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class EspecialidadesService {

  private readonly logger = new Logger('EspecialidadesService');

  constructor(
    @InjectRepository(Especialidad)
    private readonly especialidadRepository: Repository<Especialidad>,
  ) { }

  async create(createEspecialidadeDto: CreateEspecialidadDto): Promise<Especialidad> {
    try {
      const especialidad = this.especialidadRepository.create(createEspecialidadeDto)

      return await this.especialidadRepository.save(especialidad);

    } catch (error) {
      this.handleDBExceptions( error );
    }
  }

  findAll( paginationDto: PaginationDto ): Promise<Especialidad[]> {
    const { limit = 10, offset = 0 } = paginationDto;

    const especialidades = this.especialidadRepository.find({
      take: limit,
      skip: offset
    })

    return especialidades;
  }

  findOne(id: number) {
    return `This action returns a #${id} especialidade`;
  }

  update(id: number, updateEspecialidadeDto: UpdateEspecialidadeDto) {
    return `This action updates a #${id} especialidade`;
  }

  remove(id: number) {
    return `This action removes a #${id} especialidade`;
  }

  private handleDBExceptions(error: any): never {
    this.logger.error(error);

    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    throw new InternalServerErrorException('Unexpected error creating book. Check server logs.');
  }
}
