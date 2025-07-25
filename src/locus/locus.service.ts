import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Locus } from './entities/locus.entity';
import { LocusMember } from './entities/locus-member.entity';
import { GetLocusQueryDto, SideloadOption } from './dto/get-locus-query.dto';
import { UserRole } from '../core/core.service';

@Injectable()
export class LocusService {
  constructor(
    @InjectRepository(Locus)
    private locusRepository: Repository<Locus>,
    @InjectRepository(LocusMember)
    private locusMemberRepository: Repository<LocusMember>,
  ) {}

  async findAll(query: GetLocusQueryDto, userRole: UserRole) {
    const queryBuilder = this.buildQuery(query, userRole);

    const page = query.page || 1;
    const limit = query.limit || 1000;

    const [loci, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    let included: LocusMember[] = [];
    if (query.sideload?.includes(SideloadOption.LOCUS_MEMBERS) && userRole !== UserRole.NORMAL) {
      await this.loadLocusMembers(loci);
      // Extract all locus members for included field
      included = loci.flatMap(locus => locus.locusMembers || []);
    }

    return {
      data: loci,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
      ...(included.length > 0 && { included }),
    };
  }

  private buildQuery(query: GetLocusQueryDto, userRole: UserRole): SelectQueryBuilder<Locus> {
    let queryBuilder = this.locusRepository.createQueryBuilder('locus');

    // Apply filters
    if (query.id) {
      queryBuilder = queryBuilder.andWhere('locus.id = :id', { id: query.id });
    }

    if (query.assemblyId) {
      queryBuilder = queryBuilder.andWhere('locus.assemblyId = :assemblyId', { assemblyId: query.assemblyId });
    }

    // TODO: DB does not have regionId, such as 86118093, 86696489, 88186467
    // Apply role-based restrictions
    if (userRole === UserRole.LIMITED) {
      const ALLOWED_REGION_IDS = [32162857];

      queryBuilder = queryBuilder
        .innerJoin('locus.locusMembers', 'member')
        .andWhere('member.regionId IN (:...allowedRegionIds)', {
          allowedRegionIds: ALLOWED_REGION_IDS,
        })
        .distinct();
    }


    // Apply sorting
    const sortField = this.getSortField(query.sortBy || 'id');
    const sortOrder = query.sortOrder || 'ASC';
    queryBuilder = queryBuilder.orderBy(`locus.${sortField}`, sortOrder);

    return queryBuilder;
  }

  private async loadLocusMembers(loci: Locus[]) {
    const locusIds = loci.map(locus => locus.id);

    if (locusIds.length === 0) return;

    const members = await this.locusMemberRepository
      .createQueryBuilder('member')
      .where('member.locusId IN (:...locusIds)', { locusIds })
      .getMany();

    // Group members by locusId
    const membersByLocusId = members.reduce((acc, member) => {
      if (!acc[member.locusId]) {
        acc[member.locusId] = [];
      }
      acc[member.locusId].push(member);
      return acc;
    }, {} as Record<number, LocusMember[]>);

    // Assign members to loci
    loci.forEach(locus => {
      locus.locusMembers = membersByLocusId[locus.id] || [];
    });
  }

  private getSortField(sortBy: string): string {
    const fieldMap = {
      id: 'id',
      assemblyId: 'assemblyId',
      locusName: 'locusName',
      chromosome: 'chromosome',
      locusStart: 'locusStart',
      locusStop: 'locusStop',
      memberCount: 'memberCount',
    };
    return fieldMap[sortBy] || 'id';
  }
}
