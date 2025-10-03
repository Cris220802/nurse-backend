import { PartialType } from '@nestjs/mapped-types';
import { CreateEspecialidadDto } from './create-especialidad.dto';

export class UpdateEspecialidadeDto extends PartialType(CreateEspecialidadDto) {}
