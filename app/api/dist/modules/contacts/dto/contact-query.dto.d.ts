import { ContactType, Status } from "@prisma/client";
export declare class ContactQueryDto {
    search?: string;
    type?: ContactType;
    isPortalUser?: boolean;
    status?: Status;
}
