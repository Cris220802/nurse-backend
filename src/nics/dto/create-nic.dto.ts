import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateIntervencionNicDto {
  
  @IsString()
  @IsNotEmpty({ message: 'El código de la intervención no puede estar vacío.' })
  codigo_intervencion: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre de la intervención no puede estar vacío.' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres.' })
  nombre_intervencion: string;

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

  @IsUUID('4', { message: 'El ID del campo debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'Debes proporcionar el ID del campo.' })
  campoId: string;
  
  // --- IDs Opcionales para Relaciones Muchos a Muchos ---
  
  @IsArray()
  @IsUUID('4', { each: true, message: 'Cada ID de actividad debe ser un UUID válido.' })
  @IsOptional()
  actividadesIds?: string[];
  
  @IsArray()
  @IsUUID('4', { each: true, message: 'Cada ID de especialidad debe ser un UUID válido.' })
  @IsOptional()
  especialidadesIds?: string[];
}
