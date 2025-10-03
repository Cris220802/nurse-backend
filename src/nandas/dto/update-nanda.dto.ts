import { PartialType } from '@nestjs/mapped-types';
import { CreateDiagnosticoNandaDto } from './create-nanda.dto';

export class UpdateNandaDto extends PartialType(CreateDiagnosticoNandaDto) {}
