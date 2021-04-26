import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column } from 'typeorm'

@Entity('automobile_entity')
export class FileEntity {
    @PrimaryGeneratedColumn('increment') id: number;
    @CreateDateColumn()
    created: Date
    @Column("varchar", { length: 50 })
    first_name: string
    @Column("varchar", { length: 50 })
    last_name: string
    @Column("varchar", { length: 50 })
    email: string
    @Column("varchar", { length: 50 })
    car_make: string
    @Column("varchar", { length: 50 })
    car_model: string
    @Column("varchar", { length: 50 })
    vin_number: string
    @Column("date")
    manufactured_date: Date
    @Column("int", { default: 1 })
    age_of_vehicle: number

}