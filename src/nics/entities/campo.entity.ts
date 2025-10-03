import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { IntervencionNic } from "./intervencion.entity";


@Entity()
export class CampoNic {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    categoria: string;

    @Column('text', {
        unique: true
    })
    nombre: string;

    @OneToMany(
        () => IntervencionNic,
        (intervencion) => intervencion.campo
    )
    intervenciones: IntervencionNic[];
}