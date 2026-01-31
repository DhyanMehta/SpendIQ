import { ContactType, Status } from "@prisma/client";
export declare class UpdateContactDto {
    name?: string;
    email?: string;
    phone?: string;
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    type?: ContactType;
    isPortalUser?: boolean;
    tags?: string[];
    imageUrl?: string;
    status?: Status;
}
