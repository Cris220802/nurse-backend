import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ActividadNic } from "./actividad.entity";
import { Especialidad } from "src/especialidades/entities/especialidad.entity";
import { ClaseNic } from "./clase.entity";
import { CampoNic } from "./campo.entity";
import { DiagnosticoNanda } from "src/nandas/entities/diagnostico.entity";
import { ResultadoNoc } from "src/nocs/entities/resultado.entity";

@Entity()
export class IntervencionNic {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true
    })
    codigo_intervencion: string

    @Column('text', {
        unique: true
    })
    nombre_intervencion: string

    @Column('text')
    edicion: string;

    @Column('text')
    definicion: string;

    // Relacion Indicador Muchos a muchos
    @ManyToMany(() => ActividadNic)
    @JoinTable() // <-- Esto crea la tabla intermedia 
    actividades: ActividadNic[];

    // Relacion Especialidad Muchos a muchos
    @ManyToMany(() => Especialidad)
    @JoinTable() // <-- Esto crea la tabla intermedia 
    especialidades: Especialidad[];

    // relacion Clase muchos a uno
    // Muchos diagnósticos pertenecen a un patron.
    @ManyToOne(
        () => ClaseNic,
        (clase) => clase.intervenciones,
        { onDelete: 'CASCADE' } // Opcional: si borras una clase, se borran sus diagnósticos.
    )
    clase: ClaseNic;

    // relacion Patron muchos a uno
    // Muchos diagnósticos pertenecen a un patron.
    @ManyToOne(
        () => CampoNic,
        (campo) => campo.intervenciones,
        { onDelete: 'CASCADE' } // Opcional: si borras una clase, se borran sus diagnósticos.
    )
    campo: CampoNic;

    @ManyToMany(() => DiagnosticoNanda, (diagnostico) => diagnostico.intervenciones)
    diagnosticos: DiagnosticoNanda[]; // Nota: El @JoinTable está en el otro lado (Nanda)

    @ManyToMany(() => ResultadoNoc, (resultado) => resultado.intervenciones)
    @JoinTable({
        name: 'intervencion_nic_resultado_noc', // Nombre opcional para la tabla pivote
    })
    resultados: ResultadoNoc[];
}
