// import { Entity, Column, ForeignKey, ManyToOne, JoinColumn } from "typeorm";
// import { BaseEntity } from "./base";
// import { Role } from "./role";

// @Entity({ name: 'users' })
// export class User extends BaseEntity {
//   @Column({ type: 'varchar', unique: true })
//   username: string;

//   @Column({ type: 'varchar', unique: true })
//   email: string;

//   @Column({ type: 'varchar' })
//   password: string;

//   @ManyToOne(() => Role, (role) => role.id)
//   role: Role;
// }
