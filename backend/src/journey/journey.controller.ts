import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JourneyService } from './journey.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JourneyFiltersSchema } from './dto/journey-filters.dto';

@Controller('journey')
@UseGuards(JwtAuthGuard)
export class JourneyController {
  constructor(private readonly journeyService: JourneyService) {}

  @Get('patients/:patientId')
  async getPatientJourney(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Query() query: any,
    @Request() req: any,
  ) {
    const filters = JourneyFiltersSchema.parse(query);
    const orgId = req.user?.orgId || req.user?.user?.orgId;
    return this.journeyService.getPatientJourney(
      patientId,
      orgId,
      filters.page,
      filters.limit,
    );
  }
}
