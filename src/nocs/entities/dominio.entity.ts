import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ClaseNoc } from "./clase.entity";


@Entity()
export class DominioNoc {
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
        () => ClaseNoc,
        (clase) => clase.dominio
    )
    clases: ClaseNoc[];
}