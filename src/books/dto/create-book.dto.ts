import { IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";


export class CreateBookDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    author: string;

    @IsString()
    @IsNotEmpty()
    description: string;
}
