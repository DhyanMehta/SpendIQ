"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/database/prisma.service");
const client_1 = require("@prisma/client");
const mail_service_1 = require("../mail/mail.service");
let ContactsService = class ContactsService {
    constructor(prisma, mailService) {
        this.prisma = prisma;
        this.mailService = mailService;
    }
    async create(createContactDto, userId) {
        const existing = await this.prisma.contact.findUnique({
            where: { email: createContactDto.email },
        });
        if (existing) {
            throw new common_1.ConflictException("Email already in use");
        }
        const tagConnections = await this.handleTags(createContactDto.tags || []);
        const contact = await this.prisma.contact.create({
            data: {
                name: createContactDto.name,
                email: createContactDto.email,
                phone: createContactDto.phone,
                street: createContactDto.street,
                city: createContactDto.city,
                state: createContactDto.state,
                country: createContactDto.country,
                pincode: createContactDto.pincode,
                type: createContactDto.type,
                isPortalUser: createContactDto.isPortalUser || false,
                imageUrl: createContactDto.imageUrl,
                tags: {
                    create: tagConnections,
                },
                createdById: userId,
            },
            include: {
                tags: {
                    include: {
                        tag: true,
                    },
                },
            },
        });
        if (contact.isPortalUser && !contact.portalUserId) {
        }
        return contact;
    }
    async findAll(query, userId) {
        const where = {};
        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: "insensitive" } },
                { email: { contains: query.search, mode: "insensitive" } },
            ];
        }
        if (query.type) {
            where.type = query.type;
        }
        if (query.isPortalUser !== undefined) {
            where.isPortalUser = query.isPortalUser;
        }
        if (query.status) {
            where.status = query.status;
        }
        else {
            where.status = client_1.Status.ACTIVE;
        }
        if (userId) {
            where.createdById = userId;
        }
        return this.prisma.contact.findMany({
            where,
            include: {
                tags: {
                    include: {
                        tag: true,
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        });
    }
    async findOne(id) {
        const contact = await this.prisma.contact.findUnique({
            where: { id },
            include: {
                tags: {
                    include: {
                        tag: true,
                    },
                },
                portalUser: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
            },
        });
        if (!contact) {
            throw new common_1.NotFoundException("Contact not found");
        }
        return contact;
    }
    async update(id, updateContactDto) {
        const contact = await this.findOne(id);
        if (updateContactDto.email && updateContactDto.email !== contact.email) {
            const existing = await this.prisma.contact.findUnique({
                where: { email: updateContactDto.email },
            });
            if (existing) {
                throw new common_1.ConflictException("Email already in use");
            }
        }
        let tagUpdate = {};
        if (updateContactDto.tags) {
            const tagConnections = await this.handleTags(updateContactDto.tags);
            tagUpdate = {
                deleteMany: {},
                create: tagConnections,
            };
        }
        const updated = await this.prisma.contact.update({
            where: { id },
            data: Object.assign({ name: updateContactDto.name, email: updateContactDto.email, phone: updateContactDto.phone, street: updateContactDto.street, city: updateContactDto.city, state: updateContactDto.state, country: updateContactDto.country, pincode: updateContactDto.pincode, type: updateContactDto.type, imageUrl: updateContactDto.imageUrl, status: updateContactDto.status }, (updateContactDto.tags && { tags: tagUpdate })),
            include: {
                tags: {
                    include: {
                        tag: true,
                    },
                },
            },
        });
        return updated;
    }
    async archive(id) {
        await this.findOne(id);
        return this.prisma.contact.update({
            where: { id },
            data: {
                status: client_1.Status.ARCHIVED,
            },
        });
    }
    async enablePortalAccess(id) {
        const contact = await this.findOne(id);
        if (contact.portalUserId) {
            throw new common_1.ConflictException("Portal access already enabled");
        }
        const randomPassword = Math.random().toString(36).slice(-8);
        const loginId = `portal_${contact.email.split("@")[0]}_${Math.random().toString(36).slice(-4)}`;
        const portalUser = await this.prisma.user.create({
            data: {
                loginId,
                email: contact.email,
                password: randomPassword,
                name: contact.name,
                role: "PORTAL_USER",
            },
        });
        const updated = await this.prisma.contact.update({
            where: { id },
            data: {
                isPortalUser: true,
                portalUserId: portalUser.id,
            },
        });
        this.mailService
            .sendWelcomeEmail(contact.email, contact.name)
            .catch((error) => {
            console.error("[ContactsService] Failed to send portal invitation:", error);
        });
        return {
            contact: updated,
            credentials: { loginId, password: randomPassword },
        };
    }
    async handleTags(tagNames) {
        const tagConnections = [];
        for (const tagName of tagNames) {
            let tag = await this.prisma.tag.findUnique({
                where: { name: tagName },
            });
            if (!tag) {
                tag = await this.prisma.tag.create({
                    data: {
                        name: tagName,
                        color: this.generateRandomColor(),
                    },
                });
            }
            tagConnections.push({ tagId: tag.id });
        }
        return tagConnections;
    }
    generateRandomColor() {
        const colors = [
            "#3B82F6",
            "#10B981",
            "#F59E0B",
            "#EF4444",
            "#8B5CF6",
            "#EC4899",
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
};
exports.ContactsService = ContactsService;
exports.ContactsService = ContactsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mail_service_1.MailService])
], ContactsService);
//# sourceMappingURL=contacts.service.js.map