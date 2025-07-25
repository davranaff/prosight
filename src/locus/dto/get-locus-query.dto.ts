import {
  IsOptional,
  IsNumber,
  IsString,
  IsEnum,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum SideloadOption {
  LOCUS_MEMBERS = 'locusMembers',
}

export enum SortField {
  ID = 'id',
  ASSEMBLY_ID = 'assemblyId',
  LOCUS_NAME = 'locusName',
  CHROMOSOME = 'chromosome',
  LOCUS_START = 'locusStart',
  LOCUS_STOP = 'locusStop',
  MEMBER_COUNT = 'memberCount',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class GetLocusQueryDto {
  @ApiPropertyOptional({ description: 'Filter by locus ID' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  id?: number;

  @ApiPropertyOptional({ description: 'Filter by assembly ID' })
  @IsOptional()
  @Type(() => String)
  @IsString()
  assemblyId?: string;

  @ApiPropertyOptional({ description: 'Filter by region ID', isArray: true })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  regionId?: number[];

  @ApiPropertyOptional({ description: 'Filter by membership status' })
  @IsOptional()
  @IsString()
  membershipStatus?: string;

  @ApiPropertyOptional({
    description: 'Sideload related data',
    enum: SideloadOption,
    isArray: true,
  })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @IsEnum(SideloadOption, { each: true })
  sideload?: SideloadOption[];

  @ApiPropertyOptional({
    description: 'Page number',
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of rows per page',
    minimum: 1,
    maximum: 1000,
    default: 1000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number = 1000;

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: SortField,
    default: SortField.ID,
  })
  @IsOptional()
  @IsEnum(SortField)
  sortBy?: SortField = SortField.ID;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    default: SortOrder.ASC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.ASC;
}
