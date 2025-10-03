import { IsInt, IsNotEmpty, IsPositive, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateClaseNandaDto {
  
  @IsInt({ message: 'El número de clase debe ser un entero.' })
  @IsPositive({ message: 'El número de clase debe ser un número positivo.' })
  @IsNotEmpty({ message: 'El número de clase no puede estar vacío.' })
  numero: number;

  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsUUID('4', { message: 'El ID del dominio debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'Debes proporcionar el ID del dominio al que pertenece la clase.' })
  dominioId: string; // Este campo se usará para enlazar la relación
}