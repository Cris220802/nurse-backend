import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ClaseNanda } from "./clase.entity";
import { NecesidadNanda } from "./necesidad.entity";
import { PatronNanda } from "./patron.entity";
import { IntervencionNic } from "src/nics/entities/intervencion.entity";
import { ResultadoNoc } from "src/nocs/entities/resultado.entity";

@Entity()
export class DiagnosticoNanda {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true
    })
    codigo_diagnostico: string;

    @Column('text', {
        unique: true
    })
    nombre_diagnostico: string;

    @Column('text')
    edicion: string;

    @Column('text')
    definicion: string;

    @Column('text', {
        array: true,
        default: []
    })
    observaciones: string[]

    @Column('text', {
        array: true,
        default: []
    })
    caracteristicas: string[]

    @Column('text', {
        array: true,
        default: []
    })
    factores: string[]  

      // --- RELACIÓN AÑADIDA ---
    // Muchos diagnósticos pertenecen a una necesidad.
    @ManyToOne(
        () => NecesidadNanda,
        (necesidad) => necesidad.diagnosticos,
        { onDelete: 'CASCADE' } // Opcional: si borras una clase, se borran sus diagnósticos.
    )
    necesidad: NecesidadNanda;

      // --- RELACIÓN AÑADIDA ---
    // Muchos diagnósticos pertenecen a un patron.
    @ManyToOne(
        () => PatronNanda,
        (patron) => patron.diagnosticos,
        { onDelete: 'CASCADE' } // Opcional: si borras una clase, se borran sus diagnósticos.
    )
    patron: PatronNanda;
    
    // --- RELACIÓN AÑADIDA ---
    // Muchos diagnósticos pertenecen a una clase.
    @ManyToOne(
        () => ClaseNanda,
        (clase) => clase.diagnosticos,
        { onDelete: 'CASCADE' } // Opcional: si borras una clase, se borran sus diagnósticos.
    )
    clase: ClaseNanda;

    @ManyToMany(() => IntervencionNic, (intervencion) => intervencion.diagnosticos)
    @JoinTable({
        name: 'diagnostico_nanda_intervencion_nic', // Nombre opcional para la tabla pivote
    })
    intervenciones: IntervencionNic[];

    @ManyToMany(() => ResultadoNoc, (resultado) => resultado.diagnosticos)
    @JoinTable({
        name: 'diagnostico_nanda_resultado_noc', // Nombre opcional para la tabla pivote
    })
    resultados: ResultadoNoc[];
  
}