import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Book {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text',{
        unique: true
    })
    name: string;

    @Column('text', {
        unique: true
    })
    image: string;
}
