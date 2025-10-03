import { IsInt, IsNotEmpty, IsPositive, IsString, MinLength } from 'class-validator';

export class CreatePatronNandaDto {
  
  @IsString({ message: 'La categoria del patron debe ser un entero.' })
  @IsNotEmpty({ message: 'La categoria del patron no puede estar vacío.' })
  categoria: string;

  @IsString({ message: 'El nombre del patron debe ser un texto.' })
  @MinLength(3, { message: 'El nombre del patron debe tener al menos 3 caracteres.' })
  @IsNotEmpty({ message: 'El nombre del patron no puede estar vacío.' })
  nombre: string;
}