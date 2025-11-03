import { PartialType } from '@nestjs/mapped-types';
import { CreateResultadoNocDto } from './create-noc.dto';
import { IsArray, IsOptional, IsUUID } from 'class-validator';

export class UpdateNocDto extends PartialType(CreateResultadoNocDto) {

  @IsArray({ message: 'Los diagnósticos deben ser un arreglo de IDs.' })
  @IsUUID('4', { each: true, message: 'Cada ID de diagnóstico debe ser un UUID válido.' })
  @IsOptional()
  diagnosticosIds?: string[];

  @IsArray({ message: 'Las intervenciones deben ser un arreglo de IDs.' })
  @IsUUID('4', { each: true, message: 'Cada ID de intervención debe ser un UUID válido.' })
  @IsOptional()
  intervencionesIds?: string[];
}
