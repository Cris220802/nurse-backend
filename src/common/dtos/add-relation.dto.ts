import { IsUUID } from 'class-validator';

export class AddRelationDto {
    @IsUUID()
    relationId: string; // ID de la intervención a añadir
}