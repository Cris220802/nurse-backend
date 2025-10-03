// src/clase-nanda/entities/clase-nanda.entity.ts
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";// Asegúrate que la ruta sea correcta
import { DominioNanda } from "./dominio.entity";
import { DiagnosticoNanda } from "./diagnostico.entity";

@Entity()
export class ClaseNanda {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('int')
    numero: number;

    @Column('text', {
        unique: true
    })
    nombre: string;

    @Column('text')
    descripcion: string;

    // --- RELACIÓN AÑADIDA ---
    // Muchas clases pertenecen a un dominio.
    @ManyToOne(
        () => DominioNanda,
        (dominio) => dominio.clases,
        { onDelete: 'CASCADE' } // Opcional: si borras un dominio, se borran sus clases.
    )
    dominio: DominioNanda;
    
    // Dejamos preparada la relación para el siguiente paso
    @OneToMany(
        () => DiagnosticoNanda, 
        (diagnostico) => diagnostico.clase
    )
    diagnosticos: DiagnosticoNanda[]; 
}