import { PartialType } from '@nestjs/mapped-types';
import { CreateIntervencionNicDto } from './create-nic.dto';
import { IsArray, IsOptional, IsUUID } from 'class-validator';

export class UpdateNicDto extends PartialType(CreateIntervencionNicDto) {
    @IsArray({ message: 'Los diagnósticos deben ser un arreglo de IDs.' })
    @IsUUID('4', { each: true, message: 'Cada ID de diagnóstico debe ser un UUID válido.' })
    @IsOptional()
    diagnosticosIds?: string[];

    @IsArray({ message: 'Los resultados deben ser un arreglo de IDs.' })
    @IsUUID('4', { each: true, message: 'Cada ID de resultado debe ser un UUID válido.' })
    @IsOptional()
    resultadosIds?: string[];
}
