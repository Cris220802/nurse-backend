import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { DiagnosticoNanda } from "./diagnostico.entity";


@Entity()
export class PatronNanda {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    categoria: string;

    @Column('text', {
        unique: true
    })
    nombre: string;

    @OneToMany(
        () => DiagnosticoNanda,
        (diagnostico) => diagnostico.patron
    )
    diagnosticos: DiagnosticoNanda[];
}