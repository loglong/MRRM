import { Controller, Get, Query, Headers } from '@nestjs/common';
import { MobileService } from './mobile.service';
import {
  MobilePatientListDto,
  MobileDemandListDto,
} from './dto/mobile-patient.dto';

@Controller('api/mobile')
export class MobileController {
  constructor(private readonly mobileService: MobileService) {}

  @Get('patients')
  async getPatients(
    @Query() dto: MobilePatientListDto,
    @Headers('x-org-id') orgId: string,
  ) {
    return this.mobileService.getPatients(dto, orgId);
  }

  @Get('demands')
  async getDemands(
    @Query() dto: MobileDemandListDto,
    @Headers('x-org-id') orgId: string,
  ) {
    return this.mobileService.getDemands(dto, orgId);
  }

  @Get('touchpoints/recent')
  async getRecentTouchpoints(
    @Headers('x-org-id') orgId: string,
    @Query('limit') limit?: number,
  ) {
    return this.mobileService.getRecentTouchpoints(orgId, limit || 10);
  }

  @Get('followups/pending')
  async getPendingFollowups(
    @Headers('x-org-id') orgId: string,
    @Query('limit') limit?: number,
  ) {
    return this.mobileService.getPendingFollowups(orgId, limit || 20);
  }
}
