import { IsInt, IsNotEmpty, IsPositive, IsString, MinLength } from 'class-validator';

export class CreateDominioNandaDto {
  
  @IsInt({ message: 'El número de dominio debe ser un entero.' })
  @IsPositive({ message: 'El número de dominio debe ser un número positivo.' })
  @IsNotEmpty({ message: 'El número de dominio no puede estar vacío.' })
  numero: number;

  @IsString({ message: 'El nombre del dominio debe ser un texto.' })
  @MinLength(3, { message: 'El nombre del dominio debe tener al menos 3 caracteres.' })
  @IsNotEmpty({ message: 'El nombre del dominio no puede estar vacío.' })
  nombre: string;
}