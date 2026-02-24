import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { ResultadoNoc } from "./resultado.entity";

export enum Escala {
    GRAVE = 'Grave',
    SUSTANCIAL = 'Sustancial',
    MODERADO = 'Moderado',
    LEVE = 'Leve',
    NINGUNO = 'Ninguno'
}

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

    @Column('enum', {
        enum: Escala,
        default: Escala.NINGUNO
    })
    escala: Escala;

    @ManyToMany(() => ResultadoNoc, (resultado) => resultado.indicadores)
    resultados: ResultadoNoc[];
}