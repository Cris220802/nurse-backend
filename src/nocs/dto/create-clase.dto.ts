import { IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateClaseNocDto {
  
  @IsString()
  @IsNotEmpty({ message: 'La categoría no puede estar vacía.' })
  categoria: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres.' })
  nombre: string;

  @IsUUID('4', { message: 'El ID del dominio debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'Debes proporcionar el ID del dominio al que pertenece la clase.' })
  dominioId: string; // ID para establecer la relación ManyToOne
}