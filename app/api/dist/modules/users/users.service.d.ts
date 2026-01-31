import { PrismaService } from "../../common/database/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { MailService } from "../mail/mail.service";
export declare class UsersService {
    private prisma;
    private mailService;
    constructor(prisma: PrismaService, mailService: MailService);
    create(dto: CreateUserDto): Promise<{
        id: string;
        loginId: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
    }>;
}
