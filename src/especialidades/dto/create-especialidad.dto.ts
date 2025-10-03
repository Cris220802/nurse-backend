

import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateEspecialidadDto {
  
  @IsString({ message: 'El nombre de la especialidad debe ser un texto.' })
  @IsNotEmpty({ message: 'El nombre de la especialidad no puede estar vacío.' })
  @MinLength(3, { message: 'El nombre de la especialidad debe tener al menos 3 caracteres.' })
  especialidad: string;

  
}
