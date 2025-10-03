import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { DiagnosticoNanda } from "./diagnostico.entity";


@Entity()
export class NecesidadNanda {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    categoria: string;

    @Column('text', {
        unique: true
    })
    nombre: string;

    // Dejamos preparada la relación para el siguiente paso
    @OneToMany(
        () => DiagnosticoNanda,
        (diagnostico) => diagnostico.clase
    )
    diagnosticos: DiagnosticoNanda[];
}