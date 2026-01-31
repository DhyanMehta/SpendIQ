import { AnalyticsService } from "./analytics.service";
import { AnalyticsFiltersDto } from "./dto/analytics-filters.dto";
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getSummary(filters: AnalyticsFiltersDto): Promise<{
        totalBudget: number;
        totalActual: number;
        remaining: number;
        utilization: number;
    }>;
    getByAnalytic(filters: AnalyticsFiltersDto): Promise<any[]>;
    getDrilldown(analyticId: string, filters: AnalyticsFiltersDto): Promise<{
        id: string;
        invoiceNumber: string;
        date: string;
        partnerName: string;
        amount: number;
        description: string;
    }[]>;
}
