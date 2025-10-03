import { PartialType } from '@nestjs/mapped-types';
import { CreateIntervencionNicDto} from './create-nic.dto';

export class UpdateNicDto extends PartialType(CreateIntervencionNicDto) {}
