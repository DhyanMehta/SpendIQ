import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
export declare class PurchaseOrdersController {
    private readonly purchaseOrdersService;
    constructor(purchaseOrdersService: PurchaseOrdersService);
    create(createDto: CreatePurchaseOrderDto): Promise<any>;
    findAll(page?: number, limit?: number, search?: string, status?: string, vendorId?: string): Promise<{
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
