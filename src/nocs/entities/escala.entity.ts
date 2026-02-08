import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { NivelEscala } from "./nivel-escala.entity";
import { ResultadoNoc } from "./resultado.entity";

@Entity()
export class EscalaNoc {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true
    })
    codigo: string;

    @Column('text')
    descripcion: string;

    @OneToMany(
        () => NivelEscala,
        (nivel) => nivel.escala,
        { cascade: true, eager: true } // Cascade para guardar niveles al guardar la escala
    )
    niveles: NivelEscala[];

    @OneToMany(
        () => ResultadoNoc,
        (resultado) => resultado.escala
    )
    resultados: ResultadoNoc[];
}
