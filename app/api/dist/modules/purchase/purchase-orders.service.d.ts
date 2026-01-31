import { PrismaService } from '../../common/database/prisma.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
export declare class PurchaseOrdersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createDto: CreatePurchaseOrderDto): Promise<any>;
    findAll(filters: {
        page: number;
        limit: number;
        search?: string;
        status?: string;
        vendorId?: string;
    }): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<any>;
    update(id: string, updateDto: UpdatePurchaseOrderDto): Promise<any>;
    confirm(id: string): Promise<any>;
    cancel(id: string): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
