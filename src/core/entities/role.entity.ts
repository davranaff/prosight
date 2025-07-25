// import { Entity, Column, OneToMany } from "typeorm";
// import { BaseEntity } from "./base";
// import { User } from "./user";


// export enum RoleType {
//     ADMIN = 'ADMIN',
//     NORMAL = 'NORMAL',
//     LIMITED = 'LIMITED',
// }

// @Entity({ name: 'roles' })
// export class Role extends BaseEntity {
//   @Column({ type: 'varchar', unique: true })
//   name: string;

//   @Column({ type: 'varchar', nullable: true })
//   description: string;

//   @Column({ type: 'enum', enum: RoleType })
//   type: RoleType;

//   @OneToMany(() => User, (user) => user.role)
//   users: User[];
// }
