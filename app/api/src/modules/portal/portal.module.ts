import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PortalController } from "./portal.controller";
import { PortalService } from "./portal.service";
import { PrismaService } from "../../common/database/prisma.service";

@Module({
  imports: [ConfigModule],
  controllers: [PortalController],
  providers: [PortalService, PrismaService],
})
export class PortalModule { }
