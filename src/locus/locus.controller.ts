import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LocusService } from './locus.service';
import { GetLocusQueryDto } from './dto/get-locus-query.dto';
import { JwtAuthGuard } from '../core/guards/jwt-auth.guard';
import { RolesGuard } from '../core/guards/roles.guard';
import { UserRole } from '../core/core.service';

@ApiTags('Locus')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class LocusController {
  constructor(private readonly locusService: LocusService) {}

  @Get()
  @ApiOperation({ summary: 'Get locus data with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Locus data retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async findAll(
    @Query(new ValidationPipe({ transform: true })) query: GetLocusQueryDto,
    @Request() req,
  ) {
    const userRole = req.user.role;

    // Check if non-admin user is trying to use sideloading
    if (
      (userRole === UserRole.NORMAL || userRole === UserRole.LIMITED) &&
      query.sideload &&
      query.sideload.length > 0
    ) {
      throw new Error('Non-admin users cannot use sideloading');
    }

    return this.locusService.findAll(query, userRole);
  }
}
