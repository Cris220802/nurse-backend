import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateIndicadorNocDto {
  
  @IsString()
  @IsNotEmpty({ message: 'El código no puede estar vacío.' })
  codigo: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres.' })
  nombre: string;

  // Opcional: Un arreglo de UUIDs para asociar con resultados existentes
  @IsArray()
  @IsUUID('4', { each: true, message: 'Cada ID de resultado debe ser un UUID válido.' })
  @IsOptional()
  resultadosIds?: string[];
}