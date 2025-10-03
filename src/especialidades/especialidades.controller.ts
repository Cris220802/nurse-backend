import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EspecialidadesService } from './especialidades.service';
import { CreateEspecialidadDto } from './dto/create-especialidad.dto';
import { UpdateEspecialidadeDto } from './dto/update-especialidad.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('especialidades')
export class EspecialidadesController {
  constructor(private readonly especialidadesService: EspecialidadesService) {}

  @Post()
  create(@Body() createEspecialidadeDto: CreateEspecialidadDto) {
    return this.especialidadesService.create(createEspecialidadeDto);
  }

  @Get()
  findAll(  @Query() paginationDto: PaginationDto ) {
    return this.especialidadesService.findAll( paginationDto );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.especialidadesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEspecialidadeDto: UpdateEspecialidadeDto) {
    return this.especialidadesService.update(+id, updateEspecialidadeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.especialidadesService.remove(+id);
  }
}
