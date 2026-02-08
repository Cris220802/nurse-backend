import { Type } from "class-transformer";
import { IsArray, IsInt, IsNotEmpty, IsString, ValidateNested } from "class-validator";

export class CreateNivelEscalaDto {
    @IsInt()
    @IsNotEmpty()
    puntuacion: number;

    @IsString()
    @IsNotEmpty()
    texto: string;
}

export class CreateEscalaDto {
    @IsString()
    @IsNotEmpty()
    codigo: string;

    @IsString()
    @IsNotEmpty()
    descripcion: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateNivelEscalaDto)
    niveles: CreateNivelEscalaDto[];
}
