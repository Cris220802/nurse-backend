import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateIntervencionNicDto } from './dto/create-nic.dto';
import { UpdateNicDto } from './dto/update-nic.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IntervencionNic } from './entities/intervencion.entity';
import { In, Repository } from 'typeorm';
import { ClaseNic } from './entities/clase.entity';
import { CampoNic } from './entities/campo.entity';
import { ActividadNic } from './entities/actividad.entity';
import { Especialidad } from 'src/especialidades/entities/especialidad.entity';
import { CreateClaseNicDto } from './dto/create-clase.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CreateActividadNicDto } from './dto/create-actividad.dto';
import { CreateCampoNicDto } from './dto/create-campo.dto';
import { DiagnosticoNanda } from 'src/nandas/entities/diagnostico.entity';
import { ResultadoNoc } from 'src/nocs/entities/resultado.entity';

@Injectable()
export class NicsService {

  private readonly logger = new Logger('NicsService');

  constructor(
    @InjectRepository(IntervencionNic)
    private readonly intervencionNicRepository: Repository<IntervencionNic>,

    @InjectRepository(ClaseNic)
    private readonly claseNicRepository: Repository<ClaseNic>,

    @InjectRepository(CampoNic)
    private readonly campoNicRepository: Repository<CampoNic>,

    @InjectRepository(ActividadNic)
    private readonly actividadNicRepository: Repository<ActividadNic>,

    @InjectRepository(Especialidad)
    private readonly especialidadRepository: Repository<Especialidad>,

    @InjectRepository(DiagnosticoNanda)
    private readonly diagnosticoNandaRepository: Repository<DiagnosticoNanda>,

    @InjectRepository(ResultadoNoc)
    private readonly resultadoNocRepository: Repository<ResultadoNoc>,

  ) { }

  // Services Nic
  // --- MÉTODO CREATE ---
  async create(createIntervencionNicDto: CreateIntervencionNicDto): Promise<IntervencionNic> {
    const {
      claseId,
      campoId,
      actividadesIds,
      especialidadesIds,
      ...intervencionDetails
    } = createIntervencionNicDto;

    const newIntervencion = this.intervencionNicRepository.create(intervencionDetails);

    // Asignar Clase (ManyToOne)
    const clase = await this.claseNicRepository.findOneBy({ id: claseId });
    if (!clase) throw new NotFoundException(`La clase con ID "${claseId}" no fue encontrada.`);

    newIntervencion.clase = clase;

    // Asignar Campo (ManyToOne)
    const campo = await this.campoNicRepository.findOneBy({ id: campoId });
    if (!campo) throw new NotFoundException(`El campo con ID "${campoId}" no fue encontrado.`);

    newIntervencion.campo = campo;

    // Asignar Actividades (ManyToMany Opcional)
    if (actividadesIds && actividadesIds.length > 0) {
      const actividades = await this.actividadNicRepository.findBy({ id: In(actividadesIds) });
      if (actividades.length !== actividadesIds.length) {
        throw new BadRequestException('Uno o más IDs de actividades no son válidos.');
      }
      newIntervencion.actividades = actividades;
    }

    // Asignar Especialidades (ManyToMany Opcional)
    if (especialidadesIds && especialidadesIds.length > 0) {
      const especialidades = await this.especialidadRepository.findBy({ id: In(especialidadesIds) });
      if (especialidades.length !== especialidadesIds.length) {
        throw new BadRequestException('Uno o más IDs de especialidades no son válidos.');
      }
      newIntervencion.especialidades = especialidades;
    }

    // Guardar en la base de datos
    try {
      await this.intervencionNicRepository.save(newIntervencion);
      return newIntervencion;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<{ data: IntervencionNic[], total: number }> {
    const { limit = 10, offset = 0 } = paginationDto;

    const [intervenciones, total] = await this.intervencionNicRepository
      .createQueryBuilder('intervencion') // 'diagnostico' es el alias

      // --- MODIFICACIÓN CLAVE ---
      // Seleccionamos explícitamente solo los campos que necesitamos del alias 'diagnostico'
      .select([
        'intervencion.id',
        'intervencion.codigo_intervencion',
        'intervencion.nombre_intervencion',
      ])

      .skip(offset)
      .take(limit)
      .getManyAndCount(); // Ejecuta la consulta

    return {
      data: intervenciones,
      total: total,
    };
  }

  async findAllRaw(): Promise<IntervencionNic[]> {
    const intervenciones = await this.intervencionNicRepository
      .createQueryBuilder('intervencion') 
      .select([
        'intervencion.id',
        'intervencion.codigo_intervencion',
        'intervencion.nombre_intervencion',
      ])

      .getMany(); 

    return intervenciones;
  }

  // En el método findOne
  async findOne(id: string): Promise<IntervencionNic> {
    const intervencion = await this.intervencionNicRepository
      .createQueryBuilder('intervencion')
      .where('intervencion.id = :id', { id })
      // Unimos las relaciones
      .leftJoin('intervencion.clase', 'clase')
      .leftJoin('intervencion.campo', 'campo')
      .leftJoin('intervencion.actividades', 'actividad')
      .leftJoin('intervencion.diagnosticos', 'diagnostico')
      .leftJoin('intervencion.resultados', 'resultado')
      .leftJoin('intervencion.especialidades', 'especialidad')
      // Seleccionamos la entidad principal COMPLETA y los campos específicos de las relaciones
      .select([
        'intervencion', // <-- Trae todos los campos de IntervencionNic
        'clase.id', 'clase.categoria', 'clase.nombre',
        'campo.id', 'campo.categoria', 'campo.nombre',
        'actividad.id', 'actividad.codigo', 'actividad.nombre',
        'diagnostico.id', 'diagnostico.codigo_diagnostico', 'diagnostico.nombre_diagnostico',
        'resultado.id', 'resultado.codigo_resultado', 'resultado.nombre_resultado',
        'especialidad.id', 'especialidad.especialidad',
      ])
      .getOne();

    if (!intervencion) {
      throw new NotFoundException(`La intervención con el ID "${id}" no fue encontrada.`);
    }

    return intervencion;
  }

  async update(id: string, updateNicDto: UpdateNicDto): Promise<IntervencionNic> {

    // 1. Destructuramos TODOS los IDs de relaciones del DTO
    const {
      claseId,
      campoId,
      actividadesIds,
      especialidadesIds,
      diagnosticosIds,  // <-- NUEVO
      resultadosIds,    // <-- NUEVO
      ...intervencionDetails
    } = updateNicDto;

    // 2. Pre-cargamos la entidad con los detalles simples (nombre, codigo, etc.)
    const intervencion = await this.intervencionNicRepository.preload({
      id,
      ...intervencionDetails,
    });

    if (!intervencion)
      throw new NotFoundException(`Intervención con ID "${id}" no encontrada.`);

    // 3. Manejo de Relaciones ManyToOne (Clase, Campo)
    if (claseId) {
      const clase = await this.claseNicRepository.findOneBy({ id: claseId });
      if (!clase) throw new NotFoundException(`Clase con ID "${claseId}" no encontrada.`);
      intervencion.clase = clase;
    }

    if (campoId) {
      const campo = await this.campoNicRepository.findOneBy({ id: campoId });
      if (!campo) throw new NotFoundException(`Campo con ID "${campoId}" no encontrado.`);
      intervencion.campo = campo;
    }

    // 4. Manejo de Relaciones ManyToMany (Actividades)
    if (actividadesIds) {
      if (actividadesIds.length === 0) {
        intervencion.actividades = [];
      } else {
        const actividades = await this.actividadNicRepository.findBy({ id: In(actividadesIds) });
        if (actividades.length !== actividadesIds.length) {
          throw new BadRequestException('Uno o más IDs de actividades no son válidos.');
        }
        intervencion.actividades = actividades;
      }
    }

    // 5. Manejo de Relaciones ManyToMany (Especialidades)
    if (especialidadesIds) {
      if (especialidadesIds.length === 0) {
        intervencion.especialidades = [];
      } else {
        const especialidades = await this.especialidadRepository.findBy({ id: In(especialidadesIds) });
        if (especialidades.length !== especialidadesIds.length) {
          throw new BadRequestException('Uno o más IDs de especialidades no son válidos.');
        }
        intervencion.especialidades = especialidades;
      }
    }

    // 6. --- NUEVO: Manejo de Relaciones ManyToMany (Diagnósticos NANDA) ---
    if (diagnosticosIds) {
      if (diagnosticosIds.length === 0) {
        intervencion.diagnosticos = [];
      } else {
        const diagnosticos = await this.diagnosticoNandaRepository.findBy({ id: In(diagnosticosIds) });
        if (diagnosticos.length !== diagnosticosIds.length) {
          throw new BadRequestException('Uno o más IDs de Diagnósticos (NANDA) no son válidos.');
        }
        intervencion.diagnosticos = diagnosticos;
      }
    }

    // 7. --- NUEVO: Manejo de Relaciones ManyToMany (Resultados NOC) ---
    if (resultadosIds) {
      if (resultadosIds.length === 0) {
        intervencion.resultados = [];
      } else {
        const resultados = await this.resultadoNocRepository.findBy({ id: In(resultadosIds) });
        if (resultados.length !== resultadosIds.length) {
          throw new BadRequestException('Uno o más IDs de Resultados (NOC) no son válidos.');
        }
        intervencion.resultados = resultados;
      }
    }

    // 8. Guardamos la entidad actualizada
    try {
      return await this.intervencionNicRepository.save(intervencion);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string): Promise<void> {
    // 1. Usamos findOne para cargar la entidad y sus relaciones
    const intervencion = await this.findOne(id);

    // 2. Verificamos relaciones con Diagnósticos (NANDA)
    if (intervencion.diagnosticos && intervencion.diagnosticos.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar la intervención. Aún tiene ${intervencion.diagnosticos.length} diagnóstico(s) NANDA relacionado(s).`,
      );
    }

    // 3. Verificamos relaciones con Resultados (NOC)
    if (intervencion.resultados && intervencion.resultados.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar la intervención. Aún tiene ${intervencion.resultados.length} resultado(s) NOC relacionado(s).`,
      );
    }
    // 4. Si pasa las verificaciones, eliminamos
    try {
      await this.intervencionNicRepository.remove(intervencion);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  // En el método addDiagnostico
  async addDiagnostico(intervencionId: string, diagnosticoId: string) {
    // Buscamos la intervención cargando SOLO la relación que vamos a modificar.
    const intervencion = await this.intervencionNicRepository.findOne({
      where: { id: intervencionId },
      relations: {
        diagnosticos: true,
      },
    });

    if (!intervencion) throw new NotFoundException(`La intervención con ID "${intervencionId}" no fue encontrada.`);

    const diagnostico = await this.diagnosticoNandaRepository.findOneBy({ id: diagnosticoId });
    if (!diagnostico) throw new NotFoundException(`El diagnóstico con ID "${diagnosticoId}" no fue encontrado.`);

    // Ahora `intervencion.diagnosticos` es un arreglo garantizado.
    intervencion.diagnosticos.push(diagnostico);
    return this.intervencionNicRepository.save(intervencion);
  }

  // Aplica la misma lógica para addResultado
  async addResultado(intervencionId: string, resultadoId: string) {
    const intervencion = await this.intervencionNicRepository.findOne({
      where: { id: intervencionId },
      relations: {
        resultados: true,
      },
    });

    if (!intervencion) throw new NotFoundException(`La intervención con ID "${intervencionId}" no fue encontrada.`);

    const resultado = await this.resultadoNocRepository.findOneBy({ id: resultadoId });
    if (!resultado) throw new NotFoundException(`El resultado con ID "${resultadoId}" no fue encontrado.`);

    intervencion.resultados.push(resultado);
    return this.intervencionNicRepository.save(intervencion);
  }

  // Services de Clase
  async createClase(createClaseNicDto: CreateClaseNicDto): Promise<ClaseNic> {
    try {
      const clase = this.claseNicRepository.create(createClaseNicDto);

      return await this.claseNicRepository.save(clase);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAllClases(paginationDto: PaginationDto): Promise<ClaseNic[]> {
    const { limit = 10, offset = 0 } = paginationDto;

    const clases = await this.claseNicRepository.find({
      take: limit,
      skip: offset
    })

    return clases;
  }

  // Services Actividad
  async createActividad(createActividadNicDto: CreateActividadNicDto): Promise<ActividadNic> {
    try {
      // Creamos la instancia de ClaseNanda
      const actividad = this.actividadNicRepository.create(createActividadNicDto);

      return await this.actividadNicRepository.save(actividad);

    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAllActividades(paginationDto: PaginationDto): Promise<ActividadNic[]> {
    const { limit = 10, offset = 0 } = paginationDto;

    const indicadores = await this.actividadNicRepository.find({
      take: limit,
      skip: offset,
    })

    return indicadores;
  }

  // Services Campo
  async createCampo(createCampoNicDto: CreateCampoNicDto): Promise<CampoNic> {
    try {
      // Creamos la instancia de ClaseNanda
      const campo = this.campoNicRepository.create(createCampoNicDto);

      return await this.campoNicRepository.save(campo);

    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAllCampos(paginationDto: PaginationDto): Promise<CampoNic[]> {
    const { limit = 10, offset = 0 } = paginationDto;

    const campos = await this.campoNicRepository.find({
      take: limit,
      skip: offset,
    })

    return campos;
  }

  private handleDBExceptions(error: any): never {
    this.logger.error(error);

    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    if (error.code === '23503') {
      throw new BadRequestException(`No se puede procesar la solicitud: el registro está siendo utilizado o una de las relaciones no existe. Detalle: ${error.detail}`);
    }

    throw new InternalServerErrorException('Unexpected error creating book. Check server logs.');
  }
}
