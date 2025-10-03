// nandas.controller.ts

import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { NandasService } from './nandas.service';
import { CreateDiagnosticoNandaDto } from './dto/create-nanda.dto';
import { UpdateNandaDto } from './dto/update-nanda.dto';
import { CreateDominioNandaDto } from './dto/create-dominio.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CreateClaseNandaDto } from './dto/create-clase.dto';
import { CreateNecesidadNandaDto } from './dto/create-necesidad.dto';
import { CreatePatronNandaDto } from './dto/create-patron.dto';
import { AddRelationDto } from 'src/common/dtos/add-relation.dto';

@Controller('nandas')
export class NandasController {
  constructor(private readonly nandasService: NandasService) { }

  // --- RUTAS ESPECÍFICAS ---

  // Endpoints de dominios
  @Post('/dominio') // <-- Ruta estática
  createDominio(@Body() createDominioNandaDto: CreateDominioNandaDto) {
    return this.nandasService.createDominio(createDominioNandaDto);
  }

  @Get('/dominio') // <-- Ruta estática
  findAllDom(@Query() paginationDto: PaginationDto) {
    return this.nandasService.findAllDominios(paginationDto);
  }

  // Endpoints de clases
  @Post('/clase') // <-- Ruta estática
  createClase(@Body() createClaseNandaDto: CreateClaseNandaDto) {
    return this.nandasService.createClase(createClaseNandaDto);
  }

  @Get('/clase') // <-- Ruta estática
  findAllClases(@Query() paginationDto: PaginationDto) {
    return this.nandasService.findAllClases(paginationDto);
  }

  // Endpoints de necesidades
  @Post('/necesidad') // <-- Ruta estática
  createNecesidad(@Body() createNecesidadNandaDto: CreateNecesidadNandaDto) {
    return this.nandasService.createNecesidad(createNecesidadNandaDto);
  }

  @Get('/necesidad') // <-- Ruta estática
  findAllNecesidades(@Query() paginationDto: PaginationDto) {
    return this.nandasService.findAllNecesidades(paginationDto);
  }

  // Endpoints de patrones
  @Post('/patron') // <-- Ruta estática
  createPatron(@Body() createPatronNandaDto: CreatePatronNandaDto) {
    return this.nandasService.createPatron(createPatronNandaDto);
  }

  @Get('/patron') // <-- Ruta estática
  findAllPatrones(@Query() paginationDto: PaginationDto) {
    return this.nandasService.findAllPatrones(paginationDto);
  }

  // --- RUTAS GENERALES Y DINÁMICAS DESPUÉS ---

  // Endpoints de diagnosticos
  @Post()
  create(@Body() createDiagnosticoNandaDto: CreateDiagnosticoNandaDto) {
    return this.nandasService.create(createDiagnosticoNandaDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.nandasService.findAll(paginationDto);
  }

  @Get(':id') // <-- Ruta dinámica/comodín AHORA ESTÁ AL FINAL
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.nandasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNandaDto: UpdateNandaDto) {
    return this.nandasService.update(+id, updateNandaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nandasService.remove(+id);
  }

  // Endpoint para añadir una Intervención a un Diagnóstico
  @Post(':id/intervenciones')
  addIntervencion(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addRelationDto: AddRelationDto,
  ) {
    return this.nandasService.addIntervencion(id, addRelationDto.relationId);
  }

  // Endpoint para añadir un Resultado a un Diagnóstico
  @Post(':id/resultados')
  addResultado(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addRelationDto: AddRelationDto,
  ) {
    return this.nandasService.addResultado(id, addRelationDto.relationId);
  }
}