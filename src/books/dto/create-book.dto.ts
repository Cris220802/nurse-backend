import { IsOptional, IsString, MinLength } from "class-validator";


export class CreateBookDto {

    @IsString()
    @MinLength(1)
    name: string;

    @IsString()
    @IsOptional()
    image: string;
}
