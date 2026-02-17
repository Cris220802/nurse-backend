import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ClaseNic } from "./clase.entity";
import { IntervencionNic } from "./intervencion.entity";


@Entity()
export class DominioNic {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('int')
    numero: number;

    @Column('text', {
        unique: true
    })
    nombre: string;

    // --- RELACIONES ---

    // Un dominio tiene muchas clases.
    @OneToMany(
        () => ClaseNic,
        (clase) => clase.dominio
    )
    clases: ClaseNic[];

    // Un dominio tiene muchas intervenciones.
    @OneToMany(
        () => IntervencionNic,
        (intervencion) => intervencion.dominio
    )
    intervenciones: IntervencionNic[];
}
