import { ContactsService } from "./contacts.service";
import { CreateContactDto } from "./dto/create-contact.dto";
import { UpdateContactDto } from "./dto/update-contact.dto";
import { ContactQueryDto } from "./dto/contact-query.dto";
export declare class ContactsController {
    private readonly contactsService;
    constructor(contactsService: ContactsService);
    create(createContactDto: CreateContactDto, user: any): Promise<{
        tags: ({
            tag: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                color: string | null;
            };
        } & {
            tagId: string;
            contactId: string;
        })[];
    } & {
        id: string;
        email: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        state: string | null;
        createdById: string | null;
        type: import(".prisma/client").$Enums.ContactType;
        status: import(".prisma/client").$Enums.Status;
        phone: string | null;
        street: string | null;
        city: string | null;
        country: string | null;
        pincode: string | null;
        imageUrl: string | null;
        portalUserId: string | null;
        isPortalUser: boolean;
    }>;
    findAll(query: ContactQueryDto, user: any): Promise<({
        tags: ({
            tag: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                color: string | null;
            };
        } & {
            tagId: string;
            contactId: string;
        })[];
    } & {
        id: string;
        email: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        state: string | null;
        createdById: string | null;
        type: import(".prisma/client").$Enums.ContactType;
        status: import(".prisma/client").$Enums.Status;
        phone: string | null;
        street: string | null;
        city: string | null;
        country: string | null;
        pincode: string | null;
        imageUrl: string | null;
        portalUserId: string | null;
        isPortalUser: boolean;
    })[]>;
    findOne(id: string): Promise<{
        portalUser: {
            id: string;
            email: string;
            name: string;
        };
        tags: ({
            tag: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                color: string | null;
            };
        } & {
            tagId: string;
            contactId: string;
        })[];
    } & {
        id: string;
        email: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        state: string | null;
        createdById: string | null;
        type: import(".prisma/client").$Enums.ContactType;
        status: import(".prisma/client").$Enums.Status;
        phone: string | null;
        street: string | null;
        city: string | null;
        country: string | null;
        pincode: string | null;
        imageUrl: string | null;
        portalUserId: string | null;
        isPortalUser: boolean;
    }>;
    update(id: string, updateContactDto: UpdateContactDto): Promise<{
        tags: ({
            tag: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                color: string | null;
            };
        } & {
            tagId: string;
            contactId: string;
        })[];
    } & {
        id: string;
        email: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        state: string | null;
        createdById: string | null;
        type: import(".prisma/client").$Enums.ContactType;
        status: import(".prisma/client").$Enums.Status;
        phone: string | null;
        street: string | null;
        city: string | null;
        country: string | null;
        pincode: string | null;
        imageUrl: string | null;
        portalUserId: string | null;
        isPortalUser: boolean;
    }>;
    archive(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        state: string | null;
        createdById: string | null;
        type: import(".prisma/client").$Enums.ContactType;
        status: import(".prisma/client").$Enums.Status;
        phone: string | null;
        street: string | null;
        city: string | null;
        country: string | null;
        pincode: string | null;
        imageUrl: string | null;
        portalUserId: string | null;
        isPortalUser: boolean;
    }>;
    enablePortalAccess(id: string): Promise<{
        contact: {
            id: string;
            email: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            state: string | null;
            createdById: string | null;
            type: import(".prisma/client").$Enums.ContactType;
            status: import(".prisma/client").$Enums.Status;
            phone: string | null;
            street: string | null;
            city: string | null;
            country: string | null;
            pincode: string | null;
            imageUrl: string | null;
            portalUserId: string | null;
            isPortalUser: boolean;
        };
        credentials: {
            loginId: string;
            password: string;
        };
    }>;
}
