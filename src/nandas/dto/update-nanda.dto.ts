import { PartialType } from '@nestjs/mapped-types';
import { CreateDiagnosticoNandaDto } from './create-nanda.dto';
import { IsArray, IsOptional, IsUUID } from 'class-validator';

export class UpdateNandaDto extends PartialType(CreateDiagnosticoNandaDto) {

    @IsArray({ message: 'Las intervenciones deben ser un arreglo de IDs.' })
    @IsUUID('4', { each: true, message: 'Cada ID de intervención debe ser un UUID válido.' })
    @IsOptional()
    intervencionesIds?: string[];

    @IsArray({ message: 'Los resultados deben ser un arreglo de IDs.' })
    @IsUUID('4', { each: true, message: 'Cada ID de resultado debe ser un UUID válido.' })
    @IsOptional()
    resultadosIds?: string[];
}
