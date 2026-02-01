import { Controller, Get, Query, Param, UseGuards, Request } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";
import { AnalyticsFiltersDto } from "./dto/analytics-filters.dto";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Controller("analytics")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN) // Admin-only access
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) { }

  @Get("summary")
  getSummary(@Query() filters: AnalyticsFiltersDto, @Request() req: any) {
    return this.analyticsService.getSummary(filters, req?.user?.userId || req?.user?.id);
  }

  @Get("by-analytic")
  getByAnalytic(@Query() filters: AnalyticsFiltersDto, @Request() req: any) {
    return this.analyticsService.getByAnalytic(filters, req?.user?.userId || req?.user?.id);
  }

  @Get(":analyticId/drilldown")
  getDrilldown(
    @Param("analyticId") analyticId: string,
    @Query() filters: AnalyticsFiltersDto,
    @Request() req: any,
  ) {
    return this.analyticsService.getDrilldown(analyticId, filters, req?.user?.userId || req?.user?.id);
  }
}
