import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreatePatronNocDto {
  
  @IsString()
  @IsNotEmpty({ message: 'La categoría no puede estar vacía.' })
  categoria: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres.' })
  nombre: string;
}