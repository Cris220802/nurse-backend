import { PartialType } from '@nestjs/mapped-types';
import { CreateResultadoNocDto } from './create-noc.dto';

export class UpdateNocDto extends PartialType(CreateResultadoNocDto) {}
