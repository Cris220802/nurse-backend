import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { IntervencionNic } from "./intervencion.entity";


@Entity()
export class ActividadNic {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true
    })
    codigo: string

    @Column('text', {
        unique: true
    })
    nombre: string

    @ManyToMany(() => IntervencionNic, (intervencion) => intervencion.actividades)
    intervenciones: IntervencionNic[];
}