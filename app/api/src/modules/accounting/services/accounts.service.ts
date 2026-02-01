import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../common/database/prisma.service";
import { Account, Prisma } from "@prisma/client";

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.AccountCreateInput): Promise<Account> {
    return this.prisma.account.create({ data });
  }

  async findAll(): Promise<Account[]> {
    return this.prisma.account.findMany({
      orderBy: { code: "asc" },
    });
  }

  async findOne(id: string): Promise<Account | null> {
    return this.prisma.account.findUnique({ where: { id } });
  }
}
