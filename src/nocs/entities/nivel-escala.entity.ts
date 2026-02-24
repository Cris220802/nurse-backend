import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { EscalaNoc } from "./escala.entity";

@Entity()
export class NivelEscala {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('int')
    puntuacion: number;

    @Column('text')
    texto: string;

    @ManyToOne(
        () => EscalaNoc,
        (escala) => escala.niveles,
        { onDelete: 'CASCADE' }
    )
    escala: EscalaNoc;
}
