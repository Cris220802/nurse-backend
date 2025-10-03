import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateActividadNicDto {
  
  @IsString()
  @IsNotEmpty({ message: 'El código no puede estar vacío.' })
  codigo: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres.' })
  nombre: string;
}