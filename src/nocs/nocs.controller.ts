import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { NocsService } from './nocs.service';
import { CreateResultadoNocDto } from './dto/create-noc.dto';
import { UpdateNocDto } from './dto/update-noc.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CreateDominioNocDto } from './dto/create-dominio.dto';
import { CreateClaseNocDto } from './dto/create-clase.dto';
import { CreateIndicadorNocDto } from './dto/create-indicador.dto';
import { CreatePatronNocDto } from './dto/create-patron.dto';
import { AddRelationDto } from 'src/common/dtos/add-relation.dto';
import { CreateEscalaDto } from './dto/create-escala.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('nocs')
export class NocsController {
  constructor(private readonly nocsService: NocsService) { }

  // --- RUTAS ESPECÍFICAS ---

  // Endpoints de dominios
  @UseGuards(JwtAuthGuard)
  @Post('/dominio')
  createDominio(@Body() createDominioNocDto: CreateDominioNocDto) {
    return this.nocsService.createDominio(createDominioNocDto);
  }

  @Get('/dominio')
  findAllDom(@Query() paginationDto: PaginationDto) {
    return this.nocsService.findAllDominios(paginationDto);
  }

  // Endpoints de clases
  @UseGuards(JwtAuthGuard)
  @Post('/clase') // <-- Ruta estática
  createClase(@Body() createClaseNocDto: CreateClaseNocDto) {
    return this.nocsService.createClase(createClaseNocDto);
  }

  @Get('/clase') // <-- Ruta estática
  findAllClases(@Query() paginationDto: PaginationDto) {
    return this.nocsService.findAllClases(paginationDto);
  }

  // Endpoints de necesidades
  @UseGuards(JwtAuthGuard)
  @Post('/indicador') // <-- Ruta estática
  createIndicador(@Body() createIndicadorNocDto: CreateIndicadorNocDto) {
    return this.nocsService.createIndicador(createIndicadorNocDto);
  }

  @Get('/indicador') // <-- Ruta estática
  findAllIndicadores(@Query() paginationDto: PaginationDto) {
    return this.nocsService.findAllIndicadores(paginationDto);
  }

  // Endpoints de patrones
  @UseGuards(JwtAuthGuard)
  @Post('/patron') // <-- Ruta estática
  createPatron(@Body() createPatronNocDto: CreatePatronNocDto) {
    return this.nocsService.createPatron(createPatronNocDto);
  }

  @Get('/patron') // <-- Ruta estática
  findAllPatrones(@Query() paginationDto: PaginationDto) {
    return this.nocsService.findAllPatrones(paginationDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/escala')
  createEscala(@Body() createEscalaDto: CreateEscalaDto) {
    return this.nocsService.createEscala(createEscalaDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/escala')
  findAllEscalas() {
    return this.nocsService.findAllEscalas();
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/escala/:id')
  removeEscala(@Param('id', ParseUUIDPipe) id: string) {
    return this.nocsService.removeEscala(id);
  }

  // Endpoints de Resultados Noc
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createResultadoNocDto: CreateResultadoNocDto) {
    return this.nocsService.create(createResultadoNocDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.nocsService.findAll(paginationDto);
  }

  @Get('all')
  findAllRaw() {
    return this.nocsService.findAllRaw();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.nocsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateNocDto: UpdateNocDto
  ) {
    return this.nocsService.update(id, updateNocDto);
  }

  // --- MODIFICADO ---
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.nocsService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/diagnosticos')
  addDiagnostico(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addRelationDto: AddRelationDto, // DTO que contiene el 'relationId' del diagnóstico
  ) {
    return this.nocsService.addDiagnostico(id, addRelationDto.relationId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/intervenciones')
  addIntervencion(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addRelationDto: AddRelationDto, // DTO que contiene el 'relationId' de la intervención
  ) {
    return this.nocsService.addIntervencion(id, addRelationDto.relationId);
  }
}
