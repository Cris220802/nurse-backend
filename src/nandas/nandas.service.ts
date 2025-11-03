import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateDiagnosticoNandaDto } from './dto/create-nanda.dto';
import { UpdateNandaDto } from './dto/update-nanda.dto';
import { CreateDominioNandaDto } from './dto/create-dominio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DiagnosticoNanda } from './entities/diagnostico.entity';
import { In, Repository } from 'typeorm';
import { ClaseNanda } from './entities/clase.entity';
import { DominioNanda } from './entities/dominio.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CreateClaseNandaDto } from './dto/create-clase.dto';
import { NecesidadNanda } from './entities/necesidad.entity';
import { PatronNanda } from './entities/patron.entity';
import { CreateNecesidadNandaDto } from './dto/create-necesidad.dto';
import { CreatePatronNandaDto } from './dto/create-patron.dto';
import { IntervencionNic } from 'src/nics/entities/intervencion.entity';
import { ResultadoNoc } from 'src/nocs/entities/resultado.entity';

@Injectable()
export class NandasService {

  private readonly logger = new Logger('NandasService');

  constructor(

    @InjectRepository(DiagnosticoNanda)
    private readonly diagnosticoNandaRepository: Repository<DiagnosticoNanda>,

    @InjectRepository(ClaseNanda)
    private readonly claseNandaRepository: Repository<ClaseNanda>,

    @InjectRepository(DominioNanda)
    private readonly dominioNandaRepository: Repository<DominioNanda>,

    @InjectRepository(NecesidadNanda)
    private readonly necesidadNandaRepository: Repository<NecesidadNanda>,

    @InjectRepository(PatronNanda)
    private readonly patronNandaRepository: Repository<PatronNanda>,

    @InjectRepository(IntervencionNic)
    private readonly intervencionNicRepository: Repository<IntervencionNic>,

    @InjectRepository(ResultadoNoc)
    private readonly resultadoNocRepository: Repository<ResultadoNoc>,

  ) { }

  // Services de Nanda
  async create(createDiagnosticoNandaDto: CreateDiagnosticoNandaDto): Promise<DiagnosticoNanda> {
    const { claseId, necesidadId, patronId, ...diagnosticoNandaDetails } = createDiagnosticoNandaDto;

    const clase = await this.claseNandaRepository.findOneBy({ id: claseId });

    if (!clase) throw new NotFoundException(`La clase con el ID "${clase}" no fue encontrado.`);

    const necesidad = await this.necesidadNandaRepository.findOneBy({ id: necesidadId });

    if (!necesidad) throw new NotFoundException(`La necesidad con el ID "${necesidad}" no fue encontrado.`);

    const patron = await this.patronNandaRepository.findOneBy({ id: patronId });

    if (!patron) throw new NotFoundException(`La patron con el ID "${patron}" no fue encontrado.`);

    // Creamos la instancia de ClaseNanda
    const nuevoDiagnostico = this.diagnosticoNandaRepository.create({
      ...diagnosticoNandaDetails,
      clase,
      necesidad,
      patron
    });

    return this.diagnosticoNandaRepository.save(nuevoDiagnostico)
  }

  async findAll(paginationDto: PaginationDto): Promise<DiagnosticoNanda[]> {
    const { limit = 10, offset = 0 } = paginationDto;
    const diagnosticos = await this.diagnosticoNandaRepository
      .createQueryBuilder('diagnostico') // 'diagnostico' es el alias

      // --- MODIFICACIÓN CLAVE ---
      // Seleccionamos explícitamente solo los campos que necesitamos del alias 'diagnostico'
      .select([
        'diagnostico.id',
        'diagnostico.codigo_diagnostico',
        'diagnostico.nombre_diagnostico',
      ])

      .skip(offset)
      .take(limit)
      .getMany(); // Ejecuta la consulta
    // const queryBuilder = this.diagnosticoNandaRepository.createQueryBuilder('diagnostico');


    // const diagnosticos = await queryBuilder
    //   // // 1. Unimos y seleccionamos la relación con 'clase'
    //   // .leftJoinAndSelect('diagnostico.clase', 'clase')
    //   // .leftJoinAndSelect('diagnostico.necesidad', 'necesidad')
    //   // .leftJoinAndSelect('diagnostico.patron', 'patron')
    //   // // 2. Desde 'clase', unimos y seleccionamos la relación anidada con 'dominio'
    //   // .leftJoinAndSelect('clase.dominio', 'dominio')
    //   // .leftJoin('diagnostico.intervenciones', 'intervencion')
    //   // .leftJoin('diagnostico.resultados', 'resultado')
    //   // // 3. Seleccionamos los campos específicos que queremos
    //   // .select([
    //   //   'diagnostico', // <-- Trae todos los campos de la entidad principal
    //   //   'clase.id', 'clase.numero', 'clase.nombre', // <-- Solo los campos que quieres de Clase
    //   //   'dominio.id', 'dominio.numero', 'dominio.nombre', // <-- Solo los campos que quieres de Dominio
    //   //   'necesidad.id', 'necesidad.categoria', 'necesidad.nombre',
    //   //   'patron.id', 'patron.categoria', 'patron.nombre',
    //   //   'intervencion.id', 'intervencion.codigo_intervencion', 'intervencion.nombre_intervencion',
    //   //   'resultado.id', 'resultado.codigo_resultado', 'resultado.nombre_resultado'
    //   // ])
    //   .skip(offset)
    //   .take(limit)
    //   .getMany(); // <-- Ejecuta la consulta y obtiene las entidades

    return diagnosticos;
  }

  async findOne(id: string): Promise<DiagnosticoNanda> {
    const queryBuilder = this.diagnosticoNandaRepository.createQueryBuilder('diagnostico');

    const diagnostico = await queryBuilder
      // 1. Unimos las mismas relaciones anidadas
      .leftJoinAndSelect('diagnostico.clase', 'clase')
      .leftJoinAndSelect('diagnostico.necesidad', 'necesidad')
      .leftJoinAndSelect('diagnostico.patron', 'patron')
      .leftJoinAndSelect('clase.dominio', 'dominio')
      .leftJoin('diagnostico.intervenciones', 'intervencion')
      .leftJoin('diagnostico.resultados', 'resultado')
      // 2. AÑADIMOS EL FILTRO POR ID
      .where('diagnostico.id = :id', { id: id })

      // 3. Seleccionamos los mismos campos específicos
      .select([
        'diagnostico', // <-- Trae todos los campos de la entidad principal
        'clase.id', 'clase.numero', 'clase.nombre', // <-- Solo los campos que quieres de Clase
        'dominio.id', 'dominio.numero', 'dominio.nombre', // <-- Solo los campos que quieres de Dominio
        'necesidad.id', 'necesidad.categoria', 'necesidad.nombre',
        'patron.id', 'patron.categoria', 'patron.nombre',
        'intervencion.id', 'intervencion.codigo_intervencion', 'intervencion.nombre_intervencion',
        'resultado.id', 'resultado.codigo_resultado', 'resultado.nombre_resultado'
      ])

      // 4. USAMOS GETONE() PARA OBTENER UN ÚNICO RESULTADO
      .getOne();

    // 5. Verificamos si se encontró el diagnóstico
    if (!diagnostico) throw new NotFoundException(`El diagnóstico con el ID "${id}" no fue encontrado.`);

    return diagnostico;
  }

  async update(id: string, updateNandaDto: UpdateNandaDto): Promise<DiagnosticoNanda> {
    
    // 1. Destructuramos TODOS los IDs de relaciones
    const { 
      claseId, 
      necesidadId, 
      patronId, 
      intervencionesIds, // <-- NUEVO
      resultadosIds,     // <-- NUEVO
      ...diagnosticoDetails 
    } = updateNandaDto;

    // 2. Usamos 'preload' para fusionar los campos simples (nombre, definicion, etc.)
    // 'preload' NO carga las relaciones, solo prepara la entidad
    const diagnostico = await this.diagnosticoNandaRepository.preload({
      id,
      ...diagnosticoDetails,
    });

    if (!diagnostico)
      throw new NotFoundException(`Diagnóstico con ID "${id}" no encontrado.`);

    // 3. Manejo de Relaciones ManyToOne (clase, necesidad, patrón)
    if (claseId) {
      const clase = await this.claseNandaRepository.findOneBy({ id: claseId });
      if (!clase)
        throw new NotFoundException(`Clase con ID "${claseId}" no encontrada.`);
      diagnostico.clase = clase;
    }

    if (necesidadId) {
      const necesidad = await this.necesidadNandaRepository.findOneBy({ id: necesidadId });
      if (!necesidad)
        throw new NotFoundException(`Necesidad con ID "${necesidadId}" no encontrada.`);
      diagnostico.necesidad = necesidad;
    }

    if (patronId) {
      const patron = await this.patronNandaRepository.findOneBy({ id: patronId });
      if (!patron)
        throw new NotFoundException(`Patrón con ID "${patronId}" no encontrado.`);
      diagnostico.patron = patron;
    }

    // 4. --- NUEVO: Manejo de Relaciones ManyToMany (NICs) ---
    // Verificamos si 'intervencionesIds' fue enviado en el DTO
    if (intervencionesIds) {
      // Si es un array vacío, simplemente limpiamos las relaciones
      if (intervencionesIds.length === 0) {
        diagnostico.intervenciones = [];
      } else {
        // Si tiene IDs, buscamos las entidades correspondientes
        const intervenciones = await this.intervencionNicRepository.findBy({ 
          id: In(intervencionesIds) 
        });
        
        // Validación: Aseguramos que todos los IDs enviados fueron encontrados
        if (intervenciones.length !== intervencionesIds.length) {
          throw new BadRequestException('Uno o más IDs de Intervenciones (NIC) no son válidos.');
        }
        
        // Asignamos el array de entidades. TypeORM se encargará de
        // actualizar la tabla intermedia (unir-desunir) al guardar.
        diagnostico.intervenciones = intervenciones;
      }
    }

    // 5. --- NUEVO: Manejo de Relaciones ManyToMany (NOCs) ---
    // Repetimos la misma lógica para los resultados
    if (resultadosIds) {
      if (resultadosIds.length === 0) {
        diagnostico.resultados = [];
      } else {
        const resultados = await this.resultadoNocRepository.findBy({ 
          id: In(resultadosIds) 
        });

        if (resultados.length !== resultadosIds.length) {
          throw new BadRequestException('Uno o más IDs de Resultados (NOC) no son válidos.');
        }
        
        diagnostico.resultados = resultados;
      }
    }

    // 6. Guardamos la entidad actualizada
    try {
      return await this.diagnosticoNandaRepository.save(diagnostico);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string): Promise<void> {
    
    // 1. Reutilizamos findOne(id) para cargar la entidad Y SUS RELACIONES.
    // Esto ya lanza NotFoundException si no lo encuentra.
    const diagnostico = await this.findOne(id);

    // 2. Verificación de robustez: Comprobar si tiene relaciones activas (NICs o NOCs).
    // Tu método findOne ya carga 'intervenciones' y 'resultados'.
    if (diagnostico.intervenciones && diagnostico.intervenciones.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar el diagnóstico. Aún tiene ${diagnostico.intervenciones.length} intervención(es) NIC relacionada(s).`,
      );
    }

    if (diagnostico.resultados && diagnostico.resultados.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar el diagnóstico. Aún tiene ${diagnostico.resultados.length} resultado(s) NOC relacionado(s).`,
      );
    }

    // 3. Verificación de relaciones "Padre" (Clase, Necesidad, Patrón)
    // Basado en tu lógica de 'create', un diagnóstico SIEMPRE tendrá estas relaciones.
    // No es necesario comprobarlas aquí, ya que son parte del diagnóstico en sí,
    // no "hijos" que dependan de él.

    // 4. Si pasa las verificaciones, proceder a eliminar.
    try {
      // .remove() puede tomar la entidad completa
      await this.diagnosticoNandaRepository.remove(diagnostico);
    } catch (error) {
      // Captura cualquier otro error de BD (como FKs que no hayamos cargado)
      this.handleDBExceptions(error);
    }
  }

  // async addIntervencion(diagnosticoId: string, intervencionId: string) {
  //   const diagnostico = await this.findOne(diagnosticoId); // Reutilizamos findOne para cargar todo

  //   const intervencion = await this.intervencionNicRepository.findOneBy({ id: intervencionId });

  //   if (!intervencion) throw new NotFoundException('Intervención no encontrada');

  //   diagnostico.intervenciones.push(intervencion);

  //   return await this.diagnosticoNandaRepository.save(diagnostico);
  // }

  // async addResultado(diagnosticoId: string, resultadoId: string) {
  //   const diagnostico = await this.findOne(diagnosticoId);

  //   const resultado = await this.resultadoNocRepository.findOneBy({ id: resultadoId });

  //   if (!resultado) throw new NotFoundException('Resultado no encontrado');

  //   diagnostico.resultados.push(resultado);

  //   return await this.diagnosticoNandaRepository.save(diagnostico);
  // }


  // Services de Clase
  async createClase(createClaseNandaDto: CreateClaseNandaDto): Promise<ClaseNanda> {
    // Extraemos el dominioId del DTO y el resto de propiedades
    const { dominioId, ...claseDetails } = createClaseNandaDto;

    const dominio = await this.dominioNandaRepository.findOneBy({ id: dominioId });

    if (!dominio) throw new NotFoundException(`El dominio con el ID "${dominioId}" no fue encontrado.`);

    // Creamos la instancia de ClaseNanda
    const nuevaClase = this.claseNandaRepository.create({
      ...claseDetails,
      dominio: dominio,
    });

    return this.claseNandaRepository.save(nuevaClase);
  }

  async findAllClases(paginationDto: PaginationDto): Promise<ClaseNanda[]> {
    const { limit = 10, offset = 0 } = paginationDto;

    const clases = await this.claseNandaRepository.find({
      take: limit,
      skip: offset,
      relations: {
        dominio: true
      }
    })

    return clases;
  }

  // Services de Dominio
  async createDominio(createDominioNandaDto: CreateDominioNandaDto): Promise<DominioNanda> {
    try {
      const dominio = this.dominioNandaRepository.create(createDominioNandaDto);

      await this.dominioNandaRepository.save(dominio);

      return dominio;

    } catch (error) {
      // Manejo de errores
      this.handleDBExceptions(error);
    }
  }

  async findAllDominios(paginationDto: PaginationDto): Promise<DominioNanda[]> {
    const { limit = 10, offset = 0 } = paginationDto;

    const dominios = await this.dominioNandaRepository.find({
      take: limit,
      skip: offset,
    })

    return dominios;
  }

  // Services de necesidad
  async createNecesidad(createNecesidadNandaDto: CreateNecesidadNandaDto): Promise<NecesidadNanda> {
    try {
      // Creamos la instancia de ClaseNanda
      const necesidad = this.necesidadNandaRepository.create(createNecesidadNandaDto);

      return await this.necesidadNandaRepository.save(necesidad);

    } catch (error) {

      this.handleDBExceptions(error);

    }
  }

  async findAllNecesidades(paginationDto: PaginationDto): Promise<NecesidadNanda[]> {
    const { limit = 10, offset = 0 } = paginationDto;

    const necesidades = await this.necesidadNandaRepository.find({
      take: limit,
      skip: offset,
    })

    return necesidades;
  }

  // Services de patron
  async createPatron(createPatronNandaDto: CreatePatronNandaDto): Promise<PatronNanda> {
    try {
      // Creamos la instancia de ClaseNanda
      const patron = this.patronNandaRepository.create(createPatronNandaDto);

      return await this.patronNandaRepository.save(patron);

    } catch (error) {

      this.handleDBExceptions(error);

    }
  }

  async findAllPatrones(paginationDto: PaginationDto): Promise<PatronNanda[]> {
    const { limit = 10, offset = 0 } = paginationDto;

    const patrones = await this.patronNandaRepository.find({
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

    if (error.code === '23503') {
        throw new BadRequestException(`No se puede eliminar: el registro está siendo utilizado por otras entidades. Detalle: ${error.detail}`);
    }

    throw new InternalServerErrorException('Unexpected error creating book. Check server logs.');
  }
}
