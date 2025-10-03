import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { ResultadoNoc } from "./resultado.entity";


@Entity()
export class IndicadorNoc {

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

    @ManyToMany(() => ResultadoNoc, (resultado) => resultado.indicadores)
    resultados: ResultadoNoc[];
}