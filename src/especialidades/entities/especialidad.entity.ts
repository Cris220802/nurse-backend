import { IntervencionNic } from "src/nics/entities/intervencion.entity";
import { ResultadoNoc } from "src/nocs/entities/resultado.entity";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Especialidad {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    especialidad: string;

    @ManyToMany(() => ResultadoNoc, (resultado) => resultado.especialidades)
    resultados: ResultadoNoc[];

    @ManyToMany(() => IntervencionNic, (intervencion) => intervencion.especialidades)
    intervenciones: IntervencionNic[];
}
