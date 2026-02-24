import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { IntervencionNic } from "./intervencion.entity";
import { DominioNic } from "./dominio.entity";


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

    @ManyToOne(
        () => DominioNic,
        (dominio) => dominio.clases
    )
    dominio: DominioNic;
}