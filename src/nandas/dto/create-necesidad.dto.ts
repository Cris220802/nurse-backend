import { IsInt, IsNotEmpty, IsPositive, IsString, MinLength } from 'class-validator';

export class CreateNecesidadNandaDto {
  
  @IsString({ message: 'La categoria de la necesidad debe ser un entero.' })
  @IsNotEmpty({ message: 'La categoria de la necesidad no puede estar vacío.' })
  categoria: string;

  @IsString({ message: 'El nombre de la necesidad debe ser un texto.' })
  @MinLength(3, { message: 'El nombre de la necesidad debe tener al menos 3 caracteres.' })
  @IsNotEmpty({ message: 'El nombre de la necesidad no puede estar vacío.' })
  nombre: string;
}