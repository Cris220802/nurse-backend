import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateResultadoNocDto } from './dto/create-noc.dto';
import { UpdateNocDto } from './dto/update-noc.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ResultadoNoc } from './entities/resultado.entity';
import { In, Repository, DataSource, EntityManager } from 'typeorm';
import { ClaseNoc } from './entities/clase.entity';
import { DominioNoc } from './entities/dominio.entity';
import { Escala, IndicadorNoc } from './entities/indicador.entity';
import { PatronNoc } from './entities/patron.entity';
import { CreateClaseNocDto } from './dto/create-clase.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CreateDominioNocDto } from './dto/create-dominio.dto';
import { CreateIndicadorNocDto } from './dto/create-indicador.dto';
import { CreatePatronNocDto } from './dto/create-patron.dto';
import { Especialidad } from 'src/especialidades/entities/especialidad.entity';
import { DiagnosticoNanda } from 'src/nandas/entities/diagnostico.entity';
import { IntervencionNic } from 'src/nics/entities/intervencion.entity';
import { EscalaNoc } from './entities/escala.entity';
import { CreateEscalaDto } from './dto/create-escala.dto';
import { NivelEscala } from './entities/nivel-escala.entity';

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

    @InjectRepository(EscalaNoc)
    private readonly escalaNocRepository: Repository<EscalaNoc>,

    private readonly dataSource: DataSource,

  ) { }

  // Services de Noc
  async create(createResultadoNocDto: CreateResultadoNocDto): Promise<ResultadoNoc> {
    const {
      claseId,
      patronId,
      indicadoresIds,
      especialidadesIds,
      escalaId,
      ...resultadoDetails // El resto de propiedades del DTO
    } = createResultadoNocDto;

    // 1. Crear la instancia del resultado con los detalles básicos (puntuacion_objetivo se ignora/nulo)
    const newResultado = this.resultadoNocRepository.create({
      ...resultadoDetails,
      puntuacion_objetivo: null
    });

    // 2. Asignar la relación ManyToOne con ClaseNoc
    const clase = await this.claseNocRepository.findOneBy({ id: claseId });
    if (!clase) throw new NotFoundException(`La clase con ID "${claseId}" no fue encontrada.`);

    newResultado.clase = clase;

    // 3. Asignar la relación ManyToOne con PatronNoc
    const patron = await this.patronNocRepository.findOneBy({ id: patronId });
    if (!patron) throw new NotFoundException(`El patrón con ID "${patronId}" no fue encontrado.`);

    newResultado.patron = patron;

    // 3.1. Asignar la relación ManyToOne con EscalaNoc
    const escala = await this.escalaNocRepository.findOne({
      where: { id: escalaId },
      relations: { niveles: true }
    });
    if (!escala) throw new NotFoundException(`La escala con ID "${escalaId}" no fue encontrada.`);

    // Validar que la puntuacion_objetivo exista dentro de los niveles de la escala
    // const nivelValido = escala.niveles.some(nivel => nivel.puntuacion === resultadoDetails.puntuacion_objetivo);
    // if (!nivelValido) {
    //   throw new BadRequestException(`La puntuación objetivo "${resultadoDetails.puntuacion_objetivo}" no es válida para la escala seleccionada.`);
    // }

    newResultado.escala = escala;

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

  async findAll(paginationDto: PaginationDto): Promise<{ data: ResultadoNoc[], total: number }> {
    const { limit = 10, offset = 0 } = paginationDto;

    const [resultados, total] = await this.resultadoNocRepository
      .createQueryBuilder('resultado')
      .select([
        'resultado.id',
        'resultado.codigo_resultado',
        'resultado.nombre_resultado',
      ])
      .orderBy('resultado.id', 'ASC')
      .skip(offset)
      .take(limit)
      .getManyAndCount(); // Ejecuta la consulta

    return {
      data: resultados,
      total: total,
    };
  }

  async findAllRaw(): Promise<ResultadoNoc[]> {
    const resultados = await this.resultadoNocRepository
      .createQueryBuilder('resultado')
      .select([
        'resultado.id',
        'resultado.codigo_resultado',
        'resultado.nombre_resultado',
      ])
      .getMany();

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
      .leftJoinAndSelect('resultado.escala', 'escala')
      .leftJoinAndSelect('escala.niveles', 'nivel')
      // Seleccionamos la entidad principal COMPLETA y los campos específicos de las relaciones
      .select([
        'resultado.id', 'resultado.codigo_resultado', 'resultado.nombre_resultado',
        'resultado.definicion', 'resultado.edicion', 'resultado.puntuacion_objetivo',
        'clase.id', 'clase.nombre',
        'patron.id', 'patron.nombre',
        'dominio.id', 'dominio.numero', 'dominio.nombre',
        'indicador.id', 'indicador.codigo', 'indicador.nombre',
        'especialidad.id', 'especialidad.especialidad',
        'escala.id', 'escala.codigo',
        'nivel.id', 'nivel.puntuacion', 'nivel.texto',
        'diagnostico.id', 'diagnostico.codigo_diagnostico', 'diagnostico.nombre_diagnostico',
        'intervencion.id', 'intervencion.codigo_intervencion', 'intervencion.nombre_intervencion'
      ])
      .getOne();

    if (!resultado) {
      throw new NotFoundException(`El resultado con el ID "${id}" no fue encontrado.`);
    }

    return resultado;
  }

  async update(id: string, updateNocDto: UpdateNocDto): Promise<ResultadoNoc> {

    // 1. Destructuramos TODOS los IDs de relaciones del DTO
    const {
      claseId,
      patronId,
      indicadoresIds,
      especialidadesIds,
      diagnosticosIds,    // <-- NUEVO
      intervencionesIds,  // <-- NUEVO
      escalaId,
      ...resultadoDetails
    } = updateNocDto;

    // 2. Pre-cargamos la entidad con los detalles simples
    const resultado = await this.resultadoNocRepository.preload({
      id,
      ...resultadoDetails,
    });

    if (!resultado)
      throw new NotFoundException(`Resultado con ID "${id}" no encontrado.`);

    // 3. Manejo de Relaciones ManyToOne (Clase, Patron)
    if (claseId) {
      const clase = await this.claseNocRepository.findOneBy({ id: claseId });
      if (!clase) throw new NotFoundException(`Clase con ID "${claseId}" no encontrada.`);
      resultado.clase = clase;
    }

    if (patronId) {
      const patron = await this.patronNocRepository.findOneBy({ id: patronId });
      if (!patron) throw new NotFoundException(`Patrón con ID "${patronId}" no encontrado.`);
      resultado.patron = patron;
    }

    // 3.1 Manejo de Escala (Puntuación Objetivo eliminada)
    if (escalaId) {
      const escalaToUse = await this.escalaNocRepository.findOne({ where: { id: escalaId }, relations: { niveles: true } });

      if (!escalaToUse) throw new NotFoundException(`Escala no encontrada.`);

      // Validacion de puntuacion_objetivo eliminada

      resultado.escala = escalaToUse;
    }

    // 4. Manejo de Relaciones ManyToMany (Indicadores)
    if (indicadoresIds) {
      if (indicadoresIds.length === 0) {
        resultado.indicadores = [];
      } else {
        const indicadores = await this.indicadorNocRepository.findBy({ id: In(indicadoresIds) });
        if (indicadores.length !== indicadoresIds.length) {
          throw new BadRequestException('Uno o más IDs de indicadores no son válidos.');
        }
        resultado.indicadores = indicadores;
      }
    }

    // 5. Manejo de Relaciones ManyToMany (Especialidades)
    if (especialidadesIds) {
      if (especialidadesIds.length === 0) {
        resultado.especialidades = [];
      } else {
        const especialidades = await this.especialidadRepository.findBy({ id: In(especialidadesIds) });
        if (especialidades.length !== especialidadesIds.length) {
          throw new BadRequestException('Uno o más IDs de especialidades no son válidos.');
        }
        resultado.especialidades = especialidades;
      }
    }

    // 6. --- NUEVO: Manejo de Relaciones ManyToMany (Diagnósticos NANDA) ---
    if (diagnosticosIds) {
      if (diagnosticosIds.length === 0) {
        resultado.diagnosticos = [];
      } else {
        const diagnosticos = await this.diagnosticoNandaRepository.findBy({ id: In(diagnosticosIds) });
        if (diagnosticos.length !== diagnosticosIds.length) {
          throw new BadRequestException('Uno o más IDs de Diagnósticos (NANDA) no son válidos.');
        }
        resultado.diagnosticos = diagnosticos;
      }
    }

    // 7. --- NUEVO: Manejo de Relaciones ManyToMany (Intervenciones NIC) ---
    if (intervencionesIds) {
      if (intervencionesIds.length === 0) {
        resultado.intervenciones = [];
      } else {
        const intervenciones = await this.intervencionNicRepository.findBy({ id: In(intervencionesIds) });
        if (intervenciones.length !== intervencionesIds.length) {
          throw new BadRequestException('Uno o más IDs de Intervenciones (NIC) no son válidos.');
        }
        resultado.intervenciones = intervenciones;
      }
    }

    // 8. Guardamos la entidad actualizada
    try {
      return await this.resultadoNocRepository.save(resultado);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string): Promise<void> {
    // 1. Usamos findOne para cargar la entidad y sus relaciones
    const resultado = await this.findOne(id);

    // 2. Verificamos relaciones con Diagnósticos (NANDA)
    if (resultado.diagnosticos && resultado.diagnosticos.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar el resultado. Aún tiene ${resultado.diagnosticos.length} diagnóstico(s) NANDA relacionado(s).`,
      );
    }

    // 3. Verificamos relaciones con Intervenciones (NIC)
    if (resultado.intervenciones && resultado.intervenciones.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar el resultado. Aún tiene ${resultado.intervenciones.length} intervención(es) NIC relacionada(s).`,
      );
    }

    // 4. Si pasa las verificaciones, eliminamos
    try {
      await this.resultadoNocRepository.remove(resultado);
    } catch (error) {
      this.handleDBExceptions(error);
    }
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

    try {
      return await this.claseNocRepository.save(nuevaClase);
    } catch (error) {
      this.handleDBExceptions(error);
    }

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

  // Services de Escala
  async createEscala(createEscalaDto: CreateEscalaDto): Promise<EscalaNoc> {
    try {
      const { niveles, ...escalaDetails } = createEscalaDto;
      const escala = this.escalaNocRepository.create({
        ...escalaDetails,
        niveles: niveles.map(nivel => this.escalaNocRepository.manager.create(NivelEscala, nivel))
      });
      await this.escalaNocRepository.save(escala);
      return escala;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAllEscalas(): Promise<EscalaNoc[]> {
    return await this.escalaNocRepository.find({
      relations: { niveles: true },
      order: { codigo: 'ASC' }
    });
  }

  async removeEscala(id: string): Promise<void> {
    const escala = await this.escalaNocRepository.findOne({
      where: { id },
      relations: { resultados: true }
    });

    if (!escala) throw new NotFoundException(`Escala con ID "${id}" no encontrada.`);

    if (escala.resultados && escala.resultados.length > 0) {
      throw new BadRequestException(`No se puede eliminar la escala porque tiene ${escala.resultados.length} resultados asociados.`);
    }

    await this.escalaNocRepository.remove(escala);
  }

  private handleDBExceptions(error: any): never {
    this.logger.error(error);

    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    if (error.code === '23503') { // Foreign key violation
      throw new BadRequestException(`No se puede procesar la solicitud: el registro está siendo utilizado o una de las relaciones no existe. Detalle: ${error.detail}`);
    }

    throw new InternalServerErrorException('Unexpected error creating book. Check server logs.');
  }

  async createFromRawText(rawText: string): Promise<ResultadoNoc> {
    const cleanText = rawText.replace(/×/g, '').replace(/Ficha del resultado NOC/g, '').trim();

    return await this.dataSource.transaction(async (manager) => {
      const data = this.parseRawText(cleanText);

      // 1. Verificación inicial
      const existingResult = await manager.findOne(ResultadoNoc, { where: { codigo_resultado: data.codigo } });
      if (existingResult) {
        throw new ConflictException(`El Resultado NOC con código "${data.codigo}" ya existe.`);
      }

      // 2. Dominio (Upsert Pattern)
      const dominio = await this.findOrCreateDominio(manager, data.dominioNum, data.dominioNombre);

      // 3. Clase (Upsert Pattern)
      const clase = await this.findOrCreateClase(manager, data.claseCat, data.claseNombre, dominio);

      // 4. Especialidades (Upsert Pattern)
      const especialidades = await this.resolveEspecialidades(manager, data.especialidadesRaw);

      // 5. Indicadores (Upsert Pattern - AQUÍ FALLABA ANTES)
      const indicadores = await this.resolveIndicadores(manager, data.indicadoresRaw);

      // 6. Escala
      const escala = await this.resolveEscala(manager, data.escalaHeader, data.escalaContent, data.codigo);

      // 7. Guardar Resultado
      const nuevoResultado = manager.create(ResultadoNoc, {
        codigo_resultado: data.codigo,
        nombre_resultado: data.nombre,
        definicion: data.definicion,
        edicion: data.edicion,
        clase: clase,
        patron: null,
        escala: escala,
        especialidades: especialidades,
        indicadores: indicadores,
        puntuacion_objetivo: null
      });

      try {
        return await manager.save(nuevoResultado);
      } catch (error) {
        this.logger.error(`Error final guardando Resultado NOC ${data.codigo}`, error);
        throw new InternalServerErrorException("Error al guardar la entidad principal.");
      }
    });
  }

  // --- MÉTODOS PRIVADOS DE AYUDA (HELPERS) ---

  private parseRawText(text: string) {
    // Regex mejorados para ser más permisivos con espacios y saltos de línea
    const codeMatch = text.match(/Código\s*\n\s*(\d+)/i);
    const editionMatch = text.match(/Edición\s*\n\s*(.+)/i);
    const domainMatch = text.match(/Dominio\s*\n\s*(\d+)\s+(.+)/i);
    const classMatch = text.match(/Clase\s*\n\s*(\w+)\s+(.+)/i);

    // Lookahead (?=...) busca hasta encontrar "Mostrar menos", "Definición" o el final del string si falla lo anterior
    const specialtiesMatch = text.match(/Especialidades\s*\n\s*([\s\S]+?)(?=\nMostrar menos|\nDefinición|$)/i);

    const definitionMatch = text.match(/Definición\s*\n\s*([\s\S]+?)(?=\nResultado)/i);
    const nameMatch = text.match(/Resultado\s*\n\s*(.+)/i);

    // Indicadores hasta encontrar "Escala"
    const indicatorsBlockMatch = text.match(/Indicadores\s*\n\s*([\s\S]+?)(?=\nEscala)/i);

    // Escala toma el resto, tratando de separar el header (si existe) del contenido
    const scaleBlockMatch = text.match(/Escala\s*(.*)\n([\s\S]+)/i);

    if (!codeMatch || !nameMatch) {
      throw new BadRequestException("Formato inválido: No se encontró el Código o el Nombre del Resultado.");
    }

    return {
      codigo: codeMatch[1].trim(),
      edicion: editionMatch ? editionMatch[1].trim() : 'Desconocida',
      dominioNum: domainMatch ? parseInt(domainMatch[1].trim()) : 0,
      dominioNombre: domainMatch ? domainMatch[2].trim() : 'Sin Dominio',
      claseCat: classMatch ? classMatch[1].trim() : '',
      claseNombre: classMatch ? classMatch[2].trim() : '',
      especialidadesRaw: specialtiesMatch ? specialtiesMatch[1].trim() : '',
      definicion: definitionMatch ? definitionMatch[1].trim() : '',
      nombre: nameMatch[1].trim(),
      indicadoresRaw: indicatorsBlockMatch ? indicatorsBlockMatch[1].trim() : '',
      escalaHeader: scaleBlockMatch ? scaleBlockMatch[1].trim() : '',
      escalaContent: scaleBlockMatch ? scaleBlockMatch[2].trim() : ''
    };
  }

  private async findOrCreateDominio(manager: EntityManager, numero: number, nombre: string): Promise<DominioNoc> {
    // 1. Intentamos insertar. Si hay conflicto (duplicado), NO hace nada y NO aborta la transacción.
    await manager.createQueryBuilder()
      .insert()
      .into(DominioNoc)
      .values({ numero, nombre })
      .orIgnore() // Esto genera un "ON CONFLICT DO NOTHING"
      .execute();

    // 2. Ahora es seguro buscarlo, porque sabemos que existe (o existía, o se acaba de crear)
    const dominio = await manager.findOne(DominioNoc, { where: { numero } });

    if (!dominio) throw new InternalServerErrorException(`Error crítico recuperando Dominio ${numero}`);
    return dominio;
  }

  private async findOrCreateClase(manager: EntityManager, categoria: string, nombre: string, dominio: DominioNoc): Promise<ClaseNoc> {
    // Nota: Para insertar relaciones en QueryBuilder, a veces necesitas pasar el ID explícitamente si la entidad no está guardada,
    // pero aquí 'dominio' ya viene de la BD.
    await manager.createQueryBuilder()
      .insert()
      .into(ClaseNoc)
      .values({
        categoria,
        nombre,
        dominio: { id: dominio.id } // Pasamos la relación así
      })
      .orIgnore()
      .execute();

    const clase = await manager.findOne(ClaseNoc, { where: { nombre } });
    if (!clase) throw new InternalServerErrorException(`Error crítico recuperando Clase ${nombre}`);
    return clase;
  }

  private async resolveEspecialidades(manager: EntityManager, rawText: string): Promise<Especialidad[]> {
    if (!rawText) return [];

    const list = rawText.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const entities: Especialidad[] = [];

    for (const nombre of list) {
      // Insertar si no existe, ignorar si existe
      await manager.createQueryBuilder()
        .insert()
        .into(Especialidad)
        .values({ especialidad: nombre })
        .orIgnore()
        .execute();

      // Recuperar
      // Usamos ILIKE o LOWER para asegurar match insensible a mayúsculas si es Postgres
      const esp = await manager.createQueryBuilder(Especialidad, 'esp')
        .where("LOWER(esp.especialidad) = LOWER(:nombre)", { nombre })
        .getOne();

      if (esp) entities.push(esp);
    }
    return entities;
  }

  private async resolveIndicadores(manager: EntityManager, rawText: string): Promise<IndicadorNoc[]> {
    if (!rawText) return [];

    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const entities: IndicadorNoc[] = [];

    for (const line of lines) {
      const match = line.match(/^(\d+)\s*-\s*(.+)$/);
      if (match) {
        const codigo = match[1].trim();
        const nombre = match[2].trim();

        // ESTA ES LA CORRECCIÓN CLAVE:
        // En lugar de try { save } catch, usamos insert().orIgnore()

        // Importante: Si tu entidad IndicadorNoc tiene campos obligatorios (como 'escala' enum),
        // debes proveer un valor por defecto en el insert, aunque luego no se use si ya existía.
        await manager.createQueryBuilder()
          .insert()
          .into(IndicadorNoc)
          .values({
            codigo,
            nombre,
            escala: Escala.NINGUNO
          })
          .orIgnore()
          .execute();

        // Ahora recuperamos sin miedo a romper la transacción
        const indicador = await manager.findOne(IndicadorNoc, { where: { codigo } });

        if (indicador) entities.push(indicador);
      }
    }
    return entities;
  }

  private async resolveEscala(manager: EntityManager, header: string, content: string, codigoResultado: string): Promise<EscalaNoc> {

    // 1. Intentamos obtener el código del header
    let scaleCode = header ? header.replace(/^Escala\s*/i, '').trim() : '';

    // 2. Parsear niveles del contenido (texto plano del body)
    const nivelesRaw = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const nivelesParsed = nivelesRaw.map(l => {
      const m = l.match(/^(\d+)\s*-\s*(.+)$/);
      return m ? { puntuacion: parseInt(m[1]), texto: m[2].trim() } : null;
    }).filter(n => n !== null) as { puntuacion: number, texto: string }[];

    // --- CORRECCIÓN INICIO ---
    // Verificamos si 'scaleCode' es en realidad un Nivel (ej: "1 - Nunca demostrado")
    // El regex busca: Un número, seguido de guión, seguido de texto.
    const posibleNivelEnHeader = scaleCode.match(/^(\d+)\s*-\s*(.+)$/);

    if (posibleNivelEnHeader) {
      // ¡Es un nivel atrapado en el header!
      // 1. Lo agregamos al principio del array de niveles
      nivelesParsed.unshift({
        puntuacion: parseInt(posibleNivelEnHeader[1]),
        texto: posibleNivelEnHeader[2].trim()
      });

      // 2. Limpiamos scaleCode para que NO use ese texto como código de la escala.
      // Al dejarlo vacío, forzaremos la lógica de abajo a generar un código (GEN-...)
      scaleCode = '';
    }
    // --- CORRECCIÓN FIN ---

    if (nivelesParsed.length === 0) {
      throw new BadRequestException("No se encontraron niveles de escala en el texto.");
    }

    // 3. Intento por Código (Solo si scaleCode sobrevivió y es un código real válido)
    if (scaleCode) {
      const escala = await manager.findOne(EscalaNoc, { where: { codigo: scaleCode } });
      if (escala) return escala;
    }

    // 4. Búsqueda profunda (Deep comparison) para encontrar una escala idéntica existente
    const todasEscalas = await manager.find(EscalaNoc, { relations: { niveles: true } });

    for (const s of todasEscalas) {
      if (s.niveles.length === nivelesParsed.length) {
        const sNiveles = s.niveles.sort((a, b) => a.puntuacion - b.puntuacion);
        const pNiveles = [...nivelesParsed].sort((a, b) => a.puntuacion - b.puntuacion);

        let match = true;
        for (let i = 0; i < sNiveles.length; i++) {
          if (sNiveles[i].puntuacion !== pNiveles[i].puntuacion || sNiveles[i].texto.trim() !== pNiveles[i].texto.trim()) {
            match = false;
            break;
          }
        }
        if (match) return s;
      }
    }

    // 5. Crear nueva escala si no existe
    // Ahora, si scaleCode venía sucio (era un nivel), estará vacío y entrará al OR (||) generando un código GEN correcto.
    const newCode = scaleCode || `GEN-${codigoResultado}-${Date.now().toString().slice(-4)}`;

    const nuevaEscala = manager.create(EscalaNoc, {
      codigo: newCode,
      descripcion: `Escala generada para resultado ${codigoResultado}`,
      niveles: nivelesParsed.map(n => manager.create(NivelEscala, n))
    });

    return await manager.save(nuevaEscala);
  }
}
