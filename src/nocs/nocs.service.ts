import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateResultadoNocDto } from './dto/create-noc.dto';
import { UpdateNocDto } from './dto/update-noc.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ResultadoNoc } from './entities/resultado.entity';
import { In, Repository } from 'typeorm';
import { ClaseNoc } from './entities/clase.entity';
import { DominioNoc } from './entities/dominio.entity';
import { IndicadorNoc } from './entities/indicador.entity';
import { PatronNoc } from './entities/patron.entity';
import { CreateClaseNocDto } from './dto/create-clase.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CreateDominioNocDto } from './dto/create-dominio.dto';
import { CreateIndicadorNocDto } from './dto/create-indicador.dto';
import { CreatePatronNocDto } from './dto/create-patron.dto';
import { Especialidad } from 'src/especialidades/entities/especialidad.entity';
import { DiagnosticoNanda } from 'src/nandas/entities/diagnostico.entity';
import { IntervencionNic } from 'src/nics/entities/intervencion.entity';

@Injectable()
export class NocsService {

  private readonly logger = new Logger('NocsService');

  constructor(

    @InjectRepository(ResultadoNoc)
    private readonly resultadoNocRepository: Repository<ResultadoNoc>,

    @InjectRepository(ClaseNoc)
    private readonly claseNocRepository: Repository<ClaseNoc>,

    @InjectRepository(DominioNoc)
    private readonly dominioNocRepository: Repository<DominioNoc>,

    @InjectRepository(IndicadorNoc)
    private readonly indicadorNocRepository: Repository<IndicadorNoc>,

    @InjectRepository(PatronNoc)
    private readonly patronNocRepository: Repository<PatronNoc>,

    @InjectRepository(Especialidad)
    private readonly especialidadRepository: Repository<Especialidad>,

    // --- AÑADIR ESTAS INYECCIONES ---
    @InjectRepository(DiagnosticoNanda)
    private readonly diagnosticoNandaRepository: Repository<DiagnosticoNanda>,

    @InjectRepository(IntervencionNic)
    private readonly intervencionNicRepository: Repository<IntervencionNic>,

  ) { }

  // Services de Noc
  async create(createResultadoNocDto: CreateResultadoNocDto): Promise<ResultadoNoc> {
    const {
      claseId,
      patronId,
      indicadoresIds,
      especialidadesIds,
      ...resultadoDetails // El resto de propiedades del DTO
    } = createResultadoNocDto;

    // 1. Crear la instancia del resultado con los detalles básicos
    const newResultado = this.resultadoNocRepository.create(resultadoDetails);

    // 2. Asignar la relación ManyToOne con ClaseNoc
    const clase = await this.claseNocRepository.findOneBy({ id: claseId });
    if (!clase) throw new NotFoundException(`La clase con ID "${claseId}" no fue encontrada.`);

    newResultado.clase = clase;

    // 3. Asignar la relación ManyToOne con PatronNoc
    const patron = await this.patronNocRepository.findOneBy({ id: patronId });
    if (!patron) throw new NotFoundException(`El patrón con ID "${patronId}" no fue encontrado.`);

    newResultado.patron = patron;

    // 4. Asignar las relaciones ManyToMany con IndicadorNoc (si se proporcionaron IDs)
    if (indicadoresIds && indicadoresIds.length > 0) {
      const indicadores = await this.indicadorNocRepository.findBy({
        id: In(indicadoresIds),
      });
      if (indicadores.length !== indicadoresIds.length) {
        throw new BadRequestException('Uno o más IDs de indicadores no son válidos.');
      }
      newResultado.indicadores = indicadores;
    }

    // 5. Asignar las relaciones ManyToMany con Especialidad (si se proporcionaron IDs)
    if (especialidadesIds && especialidadesIds.length > 0) {
      const especialidades = await this.especialidadRepository.findBy({
        id: In(especialidadesIds),
      });
      if (especialidades.length !== especialidadesIds.length) {
        throw new BadRequestException('Uno o más IDs de especialidades no son válidos.');
      }
      newResultado.especialidades = especialidades;
    }

    // 6. Guardar la entidad completa en la base de datos
    try {
      await this.resultadoNocRepository.save(newResultado);
      return newResultado;
    } catch (error) {
      this.handleDBExceptions(error);
    }

  }

  async findAll(paginationDto: PaginationDto): Promise<ResultadoNoc[]> {
    const { limit = 10, offset = 0 } = paginationDto;

    const resultados = await this.resultadoNocRepository
      .createQueryBuilder('resultado') 
      .select([
        'resultado.id',
        'resultado.codigo_resultado',
        'resultado.nombre_resultado',
      ])

      .skip(offset)
      .take(limit)
      .getMany(); // Ejecuta la consulta

    return resultados;
  }

  async findOne(id: string): Promise<ResultadoNoc> {
    const resultado = await this.resultadoNocRepository
      .createQueryBuilder('resultado')
      .where('resultado.id = :id', { id })
      // Unimos todas las relaciones
      .leftJoin('resultado.clase', 'clase')
      .leftJoinAndSelect('clase.dominio', 'dominio')
      .leftJoin('resultado.patron', 'patron')
      .leftJoin('resultado.indicadores', 'indicador')
      .leftJoin('resultado.especialidades', 'especialidad')
      .leftJoin('resultado.diagnosticos', 'diagnostico')
      .leftJoin('resultado.intervenciones', 'intervencion')
      // Seleccionamos la entidad principal COMPLETA y los campos específicos de las relaciones
      .select([
        'resultado',
        'clase.id', 'clase.nombre',
        'patron.id', 'patron.nombre',
        'dominio.id', 'dominio.numero', 'dominio.nombre',
        'indicador.id', 'indicador.codigo', 'indicador.nombre',
        'especialidad.id', 'especialidad.especialidad',
        'diagnostico.id', 'diagnostico.codigo_diagnostico', 'diagnostico.nombre_diagnostico',
        'intervencion.id', 'intervencion.codigo_intervencion', 'intervencion.nombre_intervencion'
      ])
      .getOne();

    if (!resultado) {
      throw new NotFoundException(`El resultado con el ID "${id}" no fue encontrado.`);
    }

    return resultado;
  }

  update(id: number, updateNocDto: UpdateNocDto) {
    return `This action updates a #${id} noc`;
  }

  remove(id: number) {
    return `This action removes a #${id} noc`;
  }

  async addDiagnostico(resultadoId: string, diagnosticoId: string): Promise<ResultadoNoc> {
    // 1. Busca el resultado y carga su relación 'diagnosticos'
    const resultado = await this.resultadoNocRepository.findOne({
      where: { id: resultadoId },
      relations: { diagnosticos: true },
    });
    if (!resultado) throw new NotFoundException(`El resultado con ID "${resultadoId}" no fue encontrado.`);

    // 2. Busca el diagnóstico a añadir
    const diagnostico = await this.diagnosticoNandaRepository.findOneBy({ id: diagnosticoId });
    if (!diagnostico) throw new NotFoundException(`El diagnóstico con ID "${diagnosticoId}" no fue encontrado.`);

    // 3. Añade el diagnóstico al arreglo y guarda
    resultado.diagnosticos.push(diagnostico);
    return this.resultadoNocRepository.save(resultado);
  }

  async addIntervencion(resultadoId: string, intervencionId: string): Promise<ResultadoNoc> {
    // 1. Busca el resultado y carga su relación 'intervenciones'
    const resultado = await this.resultadoNocRepository.findOne({
      where: { id: resultadoId },
      relations: { intervenciones: true },
    });
    if (!resultado) throw new NotFoundException(`El resultado con ID "${resultadoId}" no fue encontrado.`);

    // 2. Busca la intervención a añadir
    const intervencion = await this.intervencionNicRepository.findOneBy({ id: intervencionId });
    if (!intervencion) throw new NotFoundException(`La intervención con ID "${intervencionId}" no fue encontrada.`);

    // 3. Añade la intervención al arreglo y guarda
    resultado.intervenciones.push(intervencion);
    return this.resultadoNocRepository.save(resultado);
  }

  // Services de Clase
  async createClase(createClaseNocDto: CreateClaseNocDto): Promise<ClaseNoc> {
    // Extraemos el dominioId del DTO y el resto de propiedades
    const { dominioId, ...claseDetails } = createClaseNocDto;

    const dominio = await this.dominioNocRepository.findOneBy({ id: dominioId });

    if (!dominio) throw new NotFoundException(`El dominio con el ID "${dominioId}" no fue encontrado.`);

    // Creamos la instancia de ClaseNanda
    const nuevaClase = this.claseNocRepository.create({
      ...claseDetails,
      dominio: dominio,
    });

    return await this.claseNocRepository.save(nuevaClase);
  }

  async findAllClases(paginationDto: PaginationDto): Promise<ClaseNoc[]> {
    const { limit = 10, offset = 0 } = paginationDto;

    const clases = await this.claseNocRepository.find({
      take: limit,
      skip: offset,
      relations: {
        dominio: true
      }
    })

    return clases;
  }

  // Services de Dominio
  async createDominio(createDominioNocDto: CreateDominioNocDto): Promise<DominioNoc> {
    try {
      const dominio = this.dominioNocRepository.create(createDominioNocDto);

      await this.dominioNocRepository.save(dominio);

      return dominio;

    } catch (error) {
      // Manejo de errores
      this.handleDBExceptions(error);
    }
  }

  async findAllDominios(paginationDto: PaginationDto): Promise<DominioNoc[]> {
    const { limit = 10, offset = 0 } = paginationDto;

    const dominios = await this.dominioNocRepository.find({
      take: limit,
      skip: offset,
    })

    return dominios;
  }

  // Services de indicador
  async createIndicador(createIndicadorNocDto: CreateIndicadorNocDto): Promise<IndicadorNoc> {
    try {
      // Creamos la instancia de ClaseNanda
      const indicador = this.indicadorNocRepository.create(createIndicadorNocDto);

      return await this.indicadorNocRepository.save(indicador);

    } catch (error) {

      this.handleDBExceptions(error);

    }
  }

  async findAllIndicadores(paginationDto: PaginationDto): Promise<IndicadorNoc[]> {
    const { limit = 10, offset = 0 } = paginationDto;

    const indicadores = await this.indicadorNocRepository.find({
      take: limit,
      skip: offset,
    })

    return indicadores;
  }

  // Services de patron
  async createPatron(createPatronNocDto: CreatePatronNocDto): Promise<PatronNoc> {
    try {
      // Creamos la instancia de ClaseNanda
      const patron = this.patronNocRepository.create(createPatronNocDto);

      return await this.patronNocRepository.save(patron);

    } catch (error) {

      this.handleDBExceptions(error);

    }
  }

  async findAllPatrones(paginationDto: PaginationDto): Promise<PatronNoc[]> {
    const { limit = 10, offset = 0 } = paginationDto;

    const patrones = await this.patronNocRepository.find({
      take: limit,
      skip: offset,
    })

    return patrones;
  }

  private handleDBExceptions(error: any): never {
    this.logger.error(error);

    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    throw new InternalServerErrorException('Unexpected error creating book. Check server logs.');
  }
}
