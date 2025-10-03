// src/dominio-nanda/entities/dominio-nanda.entity.ts
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ClaseNanda } from "./clase.entity";

@Entity()
export class DominioNanda {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('int')
    numero: number;

    @Column('text', {
        unique: true
    })
    nombre: string;

    // --- RELACIÓN ---
    // Un dominio tiene muchas clases.
    // El primer parámetro apunta a la entidad 'ClaseNanda'.
    // El segundo parámetro (clase => clase.dominio) indica que en la entidad ClaseNanda, 
    // la propiedad 'dominio' es la que maneja la relación inversa.
    @OneToMany(
        () => ClaseNanda,
        (clase) => clase.dominio
    )
    clases: ClaseNanda[];
}