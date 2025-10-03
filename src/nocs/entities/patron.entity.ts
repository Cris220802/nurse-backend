import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ResultadoNoc } from "./resultado.entity";

@Entity()
export class PatronNoc {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    categoria: string;

    @Column('text', {
        unique: true
    })
    nombre: string;

    @OneToMany(
        () => ResultadoNoc,
        (resultado) => resultado.patron
    )
    resultados: ResultadoNoc[];
}