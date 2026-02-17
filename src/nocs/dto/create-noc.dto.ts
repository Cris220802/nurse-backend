import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min, MinLength } from 'class-validator';

export class CreateResultadoNocDto {

  @IsString()
  @IsNotEmpty({ message: 'El código del resultado no puede estar vacío.' })
  codigo_resultado: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre del resultado no puede estar vacío.' })
  @MinLength(3, { message: 'El nombre del resultado debe tener al menos 3 caracteres.' })
  nombre_resultado: string;

  @IsString()
  @IsNotEmpty({ message: 'La edición no puede estar vacía.' })
  edicion: string;

  @IsString()
  @IsNotEmpty({ message: 'La definición no puede estar vacía.' })
  definicion: string;

  // --- IDs para Relaciones ---

  @IsUUID('4', { message: 'El ID de la clase debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'Debes proporcionar el ID de la clase.' })
  claseId: string;

  @IsUUID('4', { message: 'El ID del patrón debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'Debes proporcionar el ID del patrón.' })
  patronId: string;

  // --- IDs Opcionales para Relaciones Muchos a Muchos ---

  @IsArray()
  @IsUUID('4', { each: true, message: 'Cada ID de indicador debe ser un UUID válido.' })
  @IsOptional()
  indicadoresIds?: string[];

  @IsArray()
  @IsUUID('4', { each: true, message: 'Cada ID de especialidad debe ser un UUID válido.' })
  @IsOptional()
  especialidadesIds?: string[];

  @IsString()
  @IsNotEmpty()
  escalaId: string;

  @IsOptional()
  puntuacion_objetivo?: number;
}