import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Locus } from './locus.entity';

@Entity('rnc_locus_members')
export class LocusMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'region_id' })
  regionId: number;

  @Column({ name: 'locus_id' })
  locusId: number;

  @Column({ name: 'membership_status' })
  membershipStatus: string;

  @ManyToOne(() => Locus, (locus) => locus.locusMembers)
  @JoinColumn({ name: 'locus_id' })
  locus: Locus;
}
