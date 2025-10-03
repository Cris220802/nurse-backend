import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { NocsService } from './nocs.service';
import { CreateResultadoNocDto } from './dto/create-noc.dto';
import { UpdateNocDto } from './dto/update-noc.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CreateDominioNocDto } from './dto/create-dominio.dto';
import { CreateClaseNocDto } from './dto/create-clase.dto';
import { CreateIndicadorNocDto } from './dto/create-indicador.dto';
import { CreatePatronNocDto } from './dto/create-patron.dto';
import { AddRelationDto } from 'src/common/dtos/add-relation.dto';

@Controller('nocs')
export class NocsController {
  constructor(private readonly nocsService: NocsService) { }

  // --- RUTAS ESPECÍFICAS ---

  // Endpoints de dominios
  @Post('/dominio') // <-- Ruta estática
  createDominio(@Body() createDominioNocDto: CreateDominioNocDto) {
    return this.nocsService.createDominio(createDominioNocDto);
  }

  @Get('/dominio') // <-- Ruta estática
  findAllDom(@Query() paginationDto: PaginationDto) {
    return this.nocsService.findAllDominios(paginationDto);
  }

  // Endpoints de clases
  @Post('/clase') // <-- Ruta estática
  createClase(@Body() createClaseNocDto: CreateClaseNocDto) {
    return this.nocsService.createClase(createClaseNocDto);
  }

  @Get('/clase') // <-- Ruta estática
  findAllClases(@Query() paginationDto: PaginationDto) {
    return this.nocsService.findAllClases(paginationDto);
  }

  // Endpoints de necesidades
  @Post('/indicador') // <-- Ruta estática
  createIndicador(@Body() createIndicadorNocDto: CreateIndicadorNocDto) {
    return this.nocsService.createIndicador(createIndicadorNocDto);
  }

  @Get('/indicador') // <-- Ruta estática
  findAllIndicadores(@Query() paginationDto: PaginationDto) {
    return this.nocsService.findAllIndicadores(paginationDto);
  }

  // Endpoints de patrones
  @Post('/patron') // <-- Ruta estática
  createPatron(@Body() createPatronNocDto: CreatePatronNocDto) {
    return this.nocsService.createPatron(createPatronNocDto);
  }

  @Get('/patron') // <-- Ruta estática
  findAllPatrones(@Query() paginationDto: PaginationDto) {
    return this.nocsService.findAllPatrones(paginationDto);
  }

  // Endpoints de Resultados Noc
  @Post()
  create(@Body() createResultadoNocDto: CreateResultadoNocDto) {
    return this.nocsService.create(createResultadoNocDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.nocsService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.nocsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNocDto: UpdateNocDto) {
    return this.nocsService.update(+id, updateNocDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nocsService.remove(+id);
  }

  @Post(':id/diagnosticos')
    addDiagnostico(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() addRelationDto: AddRelationDto, // DTO que contiene el 'relationId' del diagnóstico
    ) {
        return this.nocsService.addDiagnostico(id, addRelationDto.relationId);
    }

    @Post(':id/intervenciones')
    addIntervencion(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() addRelationDto: AddRelationDto, // DTO que contiene el 'relationId' de la intervención
    ) {
        return this.nocsService.addIntervencion(id, addRelationDto.relationId);
    }
}
