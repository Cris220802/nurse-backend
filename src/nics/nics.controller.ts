import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, UseGuards, BadRequestException } from '@nestjs/common';
import { NicsService } from './nics.service';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CreateIntervencionNicDto } from './dto/create-nic.dto';
import { CreateClaseNicDto } from './dto/create-clase.dto';
import { CreateCampoNicDto } from './dto/create-campo.dto';
import { CreateActividadNicDto } from './dto/create-actividad.dto';
import { UpdateNicDto } from './dto/update-nic.dto';
import { AddRelationDto } from 'src/common/dtos/add-relation.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('nics')
export class NicsController {
  constructor(private readonly nicsService: NicsService) { }

  // --- Endpoints de Clases ---
  @UseGuards(JwtAuthGuard)
  @Post('/clase')
  createClase(@Body() createClaseNicDto: CreateClaseNicDto) {
    return this.nicsService.createClase(createClaseNicDto);
  }

  @Get('/clase')
  findAllClases(@Query() paginationDto: PaginationDto) {
    return this.nicsService.findAllClases(paginationDto);
  }

  // --- Endpoints de Campos ---
  @UseGuards(JwtAuthGuard)
  @Post('/campo')
  createCampo(@Body() createCampoNicDto: CreateCampoNicDto) {
    return this.nicsService.createCampo(createCampoNicDto);
  }

  @Get('/campo')
  findAllCampos(@Query() paginationDto: PaginationDto) {
    return this.nicsService.findAllCampos(paginationDto);
  }

  // --- Endpoints de Actividades ---
  @UseGuards(JwtAuthGuard)
  @Post('/actividad')
  createActividad(@Body() createActividadNicDto: CreateActividadNicDto) {
    return this.nicsService.createActividad(createActividadNicDto);
  }

  @Get('/actividad')
  findAllActividades(@Query() paginationDto: PaginationDto) {
    return this.nicsService.findAllActividades(paginationDto);
  }

  // --- Endpoints de Intervenciones Nic (CRUD Principal) ---
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createIntervencionNicDto: CreateIntervencionNicDto) {
    return this.nicsService.create(createIntervencionNicDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.nicsService.findAll(paginationDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('import/raw')
  createFromRawText(@Body('text') text: string) {
    if (!text) throw new BadRequestException('El texto es requerido.');
    return this.nicsService.createFromRawText(text);
  }

  @Get('all')
  findAllRaw() {
    return this.nicsService.findAllRaw();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.nicsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateNicDto: UpdateNicDto
  ) {
    // Corregido: Pasamos 'id' como string, no como número
    return this.nicsService.update(id, updateNicDto);
  }

  // --- MODIFICADO ---
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    // Corregido: Pasamos 'id' como string, no como número
    return this.nicsService.remove(id);
  }

  // Endpoint para añadir una Intervención a un Diagnóstico
  @UseGuards(JwtAuthGuard)
  @Post(':id/diagnosticos')
  addDiagnostico(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addRelationDto: AddRelationDto,
  ) {
    return this.nicsService.addDiagnostico(id, addRelationDto.relationId);
  }

  // Endpoint para añadir un Resultado a un Diagnóstico
  @UseGuards(JwtAuthGuard)
  @Post(':id/resultados')
  addResultado(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addRelationDto: AddRelationDto,
  ) {
    return this.nicsService.addResultado(id, addRelationDto.relationId);
  }
}