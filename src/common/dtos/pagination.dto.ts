import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";


export class PaginationDto {

    @IsOptional()
    @IsPositive()
    @Type( () => Number ) // Convertir el query de limit de str a number
    limit?: number;

    @IsOptional()
    @Min(0)
    @Type( () => Number ) // Convertir el query de limit de str a number
    offset?: number;
}