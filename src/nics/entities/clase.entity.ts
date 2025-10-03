import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { IntervencionNic } from "./intervencion.entity";


@Entity()
export class ClaseNic {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true
    })
    categoria: string

    @Column('text', {
        unique: true
    })
    nombre: string

    @OneToMany(
        () => IntervencionNic,
        (intervencion) => intervencion.clase
    )
    intervenciones: IntervencionNic[];
}