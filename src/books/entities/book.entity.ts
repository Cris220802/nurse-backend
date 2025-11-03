import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Book {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar', {
        unique: true,
        length: 255
    })
    title: string;

    @Column('varchar', {
        length: 255
    })
    author: string;

    @Column('text', {
        nullable: true
    })
    description: string;

    @Column('varchar', {
        comment: 'Filename of the cover image'
    })
    coverImage: string;

    @Column('varchar', {
        comment: 'Filename of the book PDF'
    })
    bookFile: string;
}
