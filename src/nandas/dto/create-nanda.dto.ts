// src/diagnostico-nanda/dto/create-diagnostico-nanda.dto.ts

import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateDiagnosticoNandaDto {

  @IsString()
  @IsNotEmpty()
  codigo_diagnostico: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  nombre_diagnostico: string;

  @IsString()
  @IsNotEmpty()
  edicion: string;

  @IsString()
  @IsNotEmpty()
  definicion: string;

  @IsString()
  @IsNotEmpty()
  enfoque: string;

  @IsString()
  @IsNotEmpty()
  necesidad: string;

  @IsString()
  @IsNotEmpty()
  patron: string;

  // Para los campos que son arreglos de texto
  @IsArray({ message: 'Las observaciones deben ser un arreglo.' })
  @IsString({ each: true, message: 'Cada observación debe ser un texto.' })
  @IsOptional() // Hacemos que este campo no sea obligatorio
  observaciones?: string[];
  
  @IsArray({ message: 'Las características deben ser un arreglo.' })
  @IsString({ each: true, message: 'Cada característica debe ser un texto.' })
  @IsOptional()
  caracteristicas?: string[];

  @IsArray({ message: 'Los factores deben ser un arreglo.' })
  @IsString({ each: true, message: 'Cada factor debe ser un texto.' })
  @IsOptional()
  factores?: string[];
  
  @IsUUID('4', { message: 'El ID de la clase debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'Debes proporcionar el ID de la clase a la que pertenece el diagnóstico.' })
  claseId: string; // Campo para enlazar con la entidad ClaseNanda

  @IsUUID('4', { message: 'El ID de la necesidad debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'Debes proporcionar el ID de la clase a la que pertenece el diagnóstico.' })
  necesidadId: string; // Campo para enlazar con la entidad ClaseNanda

  @IsUUID('4', { message: 'El ID del patron debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'Debes proporcionar el ID de la clase a la que pertenece el diagnóstico.' })
  patronId: string; // Campo para enlazar con la entidad ClaseNanda
}
