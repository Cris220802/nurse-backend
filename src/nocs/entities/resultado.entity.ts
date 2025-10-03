import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PatronNoc } from "./patron.entity";
import { ClaseNoc } from "./clase.entity";
import { Especialidad } from "src/especialidades/entities/especialidad.entity";
import { IndicadorNoc } from "./indicador.entity";
import { DiagnosticoNanda } from "src/nandas/entities/diagnostico.entity";
import { IntervencionNic } from "src/nics/entities/intervencion.entity";

@Entity()
export class ResultadoNoc {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true
    })
    codigo_resultado: string

    @Column('text', {
        unique: true
    })
    nombre_resultado: string

    @Column('text')
    edicion: string;

    @Column('text')
    definicion: string;

    // Relacion Indicador Muchos a muchos
    @ManyToMany(() => IndicadorNoc)
    @JoinTable() // <-- Esto crea la tabla intermedia 
    indicadores:IndicadorNoc[];

    // Relacion Especialidad Muchos a muchos
    @ManyToMany(() => Especialidad)
    @JoinTable() // <-- Esto crea la tabla intermedia 
    especialidades: Especialidad[];

    // relacion Clase muchos a uno
    // Muchos diagnósticos pertenecen a un patron.
    @ManyToOne(
        () => ClaseNoc,
        (clase) => clase.resultados,
        { onDelete: 'CASCADE' } // Opcional: si borras una clase, se borran sus diagnósticos.
    )
    clase: ClaseNoc;

    // relacion Patron muchos a uno
    // Muchos diagnósticos pertenecen a un patron.
    @ManyToOne(
        () => PatronNoc,
        (patron) => patron.resultados,
        { onDelete: 'CASCADE' } // Opcional: si borras una clase, se borran sus diagnósticos.
    )
    patron: PatronNoc;

    @ManyToMany(() => DiagnosticoNanda, (diagnostico) => diagnostico.resultados)
    diagnosticos: DiagnosticoNanda[]; // Nota: El @JoinTable está en el otro lado (Nanda)

    @ManyToMany(() => IntervencionNic, (intervencion) => intervencion.resultados)
    intervenciones: IntervencionNic[]; // Nota: El @JoinTable está en el otro lado (Nic)
}
