import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateIntervencionNicDto } from './dto/create-nic.dto';
import { UpdateNicDto } from './dto/update-nic.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IntervencionNic } from './entities/intervencion.entity';
import { In, Repository, DataSource, EntityManager } from 'typeorm';
import { ClaseNic } from './entities/clase.entity';
import { CampoNic } from './entities/campo.entity';
import { DominioNic } from './entities/dominio.entity';
import { ActividadNic } from './entities/actividad.entity';
import { Especialidad } from 'src/especialidades/entities/especialidad.entity';
import { CreateClaseNicDto } from './dto/create-clase.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CreateActividadNicDto } from './dto/create-actividad.dto';
import { CreateCampoNicDto } from './dto/create-campo.dto';
import { DiagnosticoNanda } from 'src/nandas/entities/diagnostico.entity';
import { ResultadoNoc } from 'src/nocs/entities/resultado.entity';
import { createHash } from 'crypto';

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

    @InjectRepository(DominioNic)
    private readonly dominioNicRepository: Repository<DominioNic>,

    private readonly dataSource: DataSource,

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

    // Asignar Dominio (ManyToOne)
    // Nota: Asumimos que createIntervencionNicDto ahora tiene 'dominioId' o seguimos usando 'campoId' pero lo mapeamos?
    // El usuario dijo: "Reemplaza cualquier inyección de repositorio o lógica que use CampoNic por DominioNic".
    // Pero también: "no lo vamos a remplazar porque ya se tiene una base de datos en produccion".
    // Así que mantendré campoId si viene, y agregaré dominioId.
    // Voy a asumir que el DTO *debería* tener dominioId, pero como no puedo ver/editar el DTO ahora mismo (está en otro archivo),
    // voy a usar 'any' para evitar errores de TS si el DTO no está actualizado, O voy a asumir que 'campoId' SE CONVIERTE conceptualmente en 'dominioId'
    // en la nueva lógica si el usuario lo manda así.
    // Pero el usuario pidió "Actualiza los métodos... para que devuelvan/guarden el dominio en lugar del campo".
    // Voy a tratar de usar 'dominioId' del DTO, y si falla el build, corregiré el DTO.

    // Para no romper, si viene campoId, lo usamos. Si viene dominioId, lo usamos.
    const { dominioId } = createIntervencionNicDto as any;

    if (dominioId) {
      const dominio = await this.dominioNicRepository.findOneBy({ id: dominioId });
      if (!dominio) throw new NotFoundException(`El dominio con ID "${dominioId}" no fue encontrado.`);
      newIntervencion.dominio = dominio;
    }

    // Asignar Campo (ManyToOne) - Opcional ahora
    if (campoId) {
      const campo = await this.campoNicRepository.findOneBy({ id: campoId });
      if (!campo) throw new NotFoundException(`El campo con ID "${campoId}" no fue encontrado.`);
      newIntervencion.campo = campo;
    }

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
      .leftJoin('intervencion.dominio', 'dominio')
      .leftJoin('intervencion.actividades', 'actividad')
      .leftJoin('intervencion.diagnosticos', 'diagnostico')
      .leftJoin('intervencion.resultados', 'resultado')
      .leftJoin('intervencion.especialidades', 'especialidad')
      // Seleccionamos la entidad principal COMPLETA y los campos específicos de las relaciones
      .select([
        'intervencion', // <-- Trae todos los campos de IntervencionNic
        'clase.id', 'clase.categoria', 'clase.nombre',
        'campo.id', 'campo.categoria', 'campo.nombre',
        'dominio.id', 'dominio.numero', 'dominio.nombre',
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

  async createFromRawText(rawText: string): Promise<IntervencionNic> {
    // Limpieza inicial
    const cleanText = rawText.replace(/×/g, '').replace(/Ficha de la intervención NIC/g, '').trim();

    return await this.dataSource.transaction(async (manager) => {
      // 1. Parsing Robusto
      const data = this.parseNicText(cleanText);

      // Verificación temprana
      const existingIntervencion = await manager.findOne(IntervencionNic, { where: { codigo_intervencion: data.codigo } });
      if (existingIntervencion) {
        throw new ConflictException(`La Intervención NIC con código "${data.codigo}" ya existe.`);
      }

      // 2. Dominio (Upsert Pattern - Similar a NOC)
      const dominio = await this.findOrCreateDominio(manager, data.dominioNum, data.dominioNombre);

      // 3. Clase (Upsert Pattern)
      const clase = await this.findOrCreateClase(manager, data.claseLetra, data.claseNombre, dominio);

      // 4. Actividades (Upsert Pattern con generación de código Hash)
      const actividades = await this.resolveActividades(manager, data.actividadesRaw);

      // 5. Especialidades (Upsert Pattern)
      const especialidades = await this.resolveEspecialidades(manager, data.especialidadesRaw);

      // 6. Crear Intervención
      const nuevaIntervencion = manager.create(IntervencionNic, {
        codigo_intervencion: data.codigo,
        nombre_intervencion: data.nombre,
        definicion: data.definicion,
        edicion: data.edicion,
        dominio: dominio,
        clase: clase,
        actividades: actividades,
        especialidades: especialidades,
        // campo: null // Ya no se usa si eliminaste la entidad CampoNic
      });

      try {
        return await manager.save(nuevaIntervencion);
      } catch (error) {
        this.logger.error(`Error final guardando Intervención NIC ${data.codigo}`, error);
        throw new InternalServerErrorException("Error al guardar la entidad principal.");
      }
    });
  }

  // ---------------------------------------------------------
  // HELPERS PRIVADOS
  // ---------------------------------------------------------

  private parseNicText(text: string) {
    // Regex para bloques principales
    const editionMatch = text.match(/Edición\s*\n\s*(.+)/i);
    const domainMatch = text.match(/Dominio\s*\n\s*(\d+)\s+(.+)/i);
    const classMatch = text.match(/Clase\s*\n\s*(\w+)\s+(.+)/i);

    // Especialidades (se agrega soporte para extraerlas)
    const specialtiesMatch = text.match(/Especialidades\s*(?:\n|:)\s*([\s\S]+?)(?=\nMostrar menos|\nDefinición|\nActividades|$)/i);

    // Definición hasta encontrar "Actividades"
    const definitionMatch = text.match(/Definición\s*(?:\n|:)\s*([\s\S]+?)(?=\nActividades|\nResultado|$)/i);

    // Actividades hasta el final (más robusto ante separadores)
    const activitiesBlockMatch = text.match(/Actividades\s*(?:\n|:)\s*([\s\S]+?)(?=$)/i);

    // --- LÓGICA DE EXTRACCIÓN DE CÓDIGO Y NOMBRE ---
    let codigo = '';
    let nombre = '';

    // Estrategia 1: Buscar etiqueta explícita "Código" (si existe en el formato)
    const codeLabelMatch = text.match(/Código\s*\n\s*(\d+)/i);

    // Estrategia 2: Analizar las primeras líneas
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    if (lines.length > 0) {
      // Caso A: "1400 Manejo del dolor" (Todo en una línea)
      const oneLineMatch = lines[0].match(/^(\d{4})\s+(.+)$/);
      if (oneLineMatch) {
        codigo = oneLineMatch[1];
        nombre = oneLineMatch[2];
      }
      // Caso B: "1400" en línea 1, "Manejo del dolor" en línea 2
      else if (/^\d+$/.test(lines[0]) && lines.length > 1) {
        codigo = lines[0];
        nombre = lines[1];
      }
      // Caso C: Usar el match de etiqueta "Código" si falló lo anterior
      else if (codeLabelMatch) {
        codigo = codeLabelMatch[1];
        // Si el código está en etiqueta, el nombre suele ser la primera línea que NO sea etiqueta
        // Buscamos una línea que no sea "Código", "Edición", ni números solos.
        const nameLine = lines.find(l =>
          !l.match(/^(Código|Edición|Dominio|Clase|Definición|Actividades)/i) &&
          !/^\d+$/.test(l) &&
          l !== codigo
        );
        nombre = nameLine || 'Nombre Desconocido';
      }
    }

    if (!codigo || !nombre) {
      throw new BadRequestException("No se pudo extraer el Código o Nombre de la Intervención. Verifica el formato.");
    }

    return {
      codigo,
      nombre,
      edicion: editionMatch ? editionMatch[1].trim() : 'Desconocida',
      dominioNum: domainMatch ? parseInt(domainMatch[1].trim()) : 0,
      dominioNombre: domainMatch ? domainMatch[2].trim() : 'Sin Dominio',
      claseLetra: classMatch ? classMatch[1].trim() : '',
      claseNombre: classMatch ? classMatch[2].trim() : '',
      definicion: definitionMatch ? definitionMatch[1].trim() : '',
      actividadesRaw: activitiesBlockMatch ? activitiesBlockMatch[1].trim() : '',
      especialidadesRaw: specialtiesMatch ? specialtiesMatch[1].trim() : ''
    };
  }

  private async findOrCreateDominio(manager: EntityManager, numero: number, nombre: string): Promise<DominioNic> {
    // Insert or Ignore
    await manager.createQueryBuilder()
      .insert()
      .into(DominioNic)
      .values({ numero, nombre })
      .orIgnore()
      .execute();

    const dominio = await manager.findOne(DominioNic, { where: { numero } });
    if (!dominio) throw new InternalServerErrorException(`Error crítico recuperando Dominio NIC ${numero}`);
    return dominio;
  }

  private async findOrCreateClase(manager: EntityManager, categoria: string, nombre: string, dominio: DominioNic): Promise<ClaseNic> {
    // Insert or Ignore con relación
    await manager.createQueryBuilder()
      .insert()
      .into(ClaseNic)
      .values({
        categoria,
        nombre,
        dominio: { id: dominio.id }
      })
      .orIgnore()
      .execute();

    const clase = await manager.findOne(ClaseNic, { where: { nombre } });
    if (!clase) throw new InternalServerErrorException(`Error crítico recuperando Clase NIC ${nombre}`);
    return clase;
  }

  private async resolveActividades(manager: EntityManager, rawText: string): Promise<ActividadNic[]> {
    if (!rawText) return [];

    // Separar por saltos de línea y limpiar viñetas
    const list = rawText.split('\n')
      .map(l => l.trim().replace(/^[•\-\*]\s*/, '')) // Quita bullets •, -, *
      .filter(l => l.length > 0);

    const entities: ActividadNic[] = [];

    for (const textoActividad of list) {
      // GENERACIÓN DE CÓDIGO ÚNICO:
      // Como las actividades NIC a veces no tienen código numérico visible, generamos un hash
      // basado en el texto. Así, si la misma actividad aparece en otro lado, tendrá el mismo hash.
      // Usamos MD5 o SHA256 y tomamos los primeros 10-12 caracteres.
      const hash = createHash('md5').update(textoActividad.toLowerCase()).digest('hex').substring(0, 12).toUpperCase();
      const codigoGenerado = `ACT-${hash}`;

      // 1. Insertar (Upsert)
      await manager.createQueryBuilder()
        .insert()
        .into(ActividadNic)
        .values({
          codigo: codigoGenerado,
          nombre: textoActividad
        })
        .orIgnore()
        .execute();

      // 2. Recuperar
      const actividad = await manager.findOne(ActividadNic, { where: { codigo: codigoGenerado } });
      if (actividad) entities.push(actividad);
    }
    return entities;
  }

  private async resolveEspecialidades(manager: EntityManager, rawText: string): Promise<Especialidad[]> {
    if (!rawText) return [];

    const list = rawText.split(/\r?\n/)
      .map(l => l.trim().replace(/^•\s*/, ''))
      .filter(l => l.length > 0 && l !== 'Mostrar menos'); // Clean unwanted text

    const entities: Especialidad[] = [];

    for (const nombreEspecialidad of list) {
      // 1. Insertar (Upsert)
      await manager.createQueryBuilder()
        .insert()
        .into(Especialidad)
        .values({ especialidad: nombreEspecialidad })
        .orIgnore()
        .execute();

      // 2. Recuperar
      const especialidad = await manager.findOne(Especialidad, { where: { especialidad: nombreEspecialidad } });
      if (especialidad) entities.push(especialidad);
    }
    return entities;
  }
}
