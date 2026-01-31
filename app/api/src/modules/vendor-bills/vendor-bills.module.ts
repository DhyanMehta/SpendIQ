import { Module } from '@nestjs/common';
import { VendorBillsService } from './vendor-bills.service';
import { VendorBillsController } from './vendor-bills.controller';
import { DatabaseModule } from '../../common/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [VendorBillsController],
  providers: [VendorBillsService],
  exports: [VendorBillsService],
})
export class VendorBillsModule {}
