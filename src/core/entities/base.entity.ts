import { PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn } from "typeorm";


export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'boolean', default: false })
  isArchived: boolean;

  delete() {
    this.isArchived = true;
    // some logic to delete the entity
  }

  restore() {
    this.isArchived = false;
    // some logic to restore the entity
  }
}
