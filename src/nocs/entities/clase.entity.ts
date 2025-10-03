import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ResultadoNoc } from "./resultado.entity";
import { DominioNoc } from "./dominio.entity";


@Entity()
export class ClaseNoc {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    categoria: string;

    @Column('text', {
        unique: true
    })
    nombre: string;

    // Muchas clases pertenecen a un dominio.
    @ManyToOne(
        () => DominioNoc,
        (dominio) => dominio.clases,
        { onDelete: 'CASCADE' } // Opcional: si borras un dominio, se borran sus clases.
    )
    dominio: DominioNoc;

    @OneToMany(
        () => ResultadoNoc,
        (resultado) => resultado.clase
    )
    resultados: ResultadoNoc[];
}