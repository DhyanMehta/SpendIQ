import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../common/database/prisma.service";
import { CreateContactDto } from "./dto/create-contact.dto";
import { UpdateContactDto } from "./dto/update-contact.dto";
import { ContactQueryDto } from "./dto/contact-query.dto";
import { Status } from "@prisma/client";
import { MailService } from "../mail/mail.service";

@Injectable()
export class ContactsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) { }

  async create(createContactDto: CreateContactDto) {
    // Check for existing email
    const existing = await this.prisma.contact.findUnique({
      where: { email: createContactDto.email },
    });

    if (existing) {
      throw new ConflictException("Email already in use");
    }

    // Handle tags
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
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // If portal access enabled, send invitation email
    if (contact.isPortalUser && !contact.portalUserId) {
      // TODO: Create portal user and send invitation
      // This would be handled separately via enablePortalAccess method
    }

    return contact;
  }

  async findAll(query: ContactQueryDto) {
    const where: any = {};

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
    } else {
      // Default: only show active contacts
      where.status = Status.ACTIVE;
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

  async findOne(id: string) {
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
      throw new NotFoundException("Contact not found");
    }

    return contact;
  }

  async update(id: string, updateContactDto: UpdateContactDto) {
    const contact = await this.findOne(id);

    // Check email uniqueness if changing
    if (updateContactDto.email && updateContactDto.email !== contact.email) {
      const existing = await this.prisma.contact.findUnique({
        where: { email: updateContactDto.email },
      });

      if (existing) {
        throw new ConflictException("Email already in use");
      }
    }

    // Handle tags update
    let tagUpdate = {};
    if (updateContactDto.tags) {
      const tagConnections = await this.handleTags(updateContactDto.tags);
      tagUpdate = {
        deleteMany: {}, // Remove all existing tags
        create: tagConnections, // Add new tags
      };
    }

    const updated = await this.prisma.contact.update({
      where: { id },
      data: {
        name: updateContactDto.name,
        email: updateContactDto.email,
        phone: updateContactDto.phone,
        street: updateContactDto.street,
        city: updateContactDto.city,
        state: updateContactDto.state,
        country: updateContactDto.country,
        pincode: updateContactDto.pincode,
        type: updateContactDto.type,
        imageUrl: updateContactDto.imageUrl,
        status: updateContactDto.status,
        ...(updateContactDto.tags && { tags: tagUpdate }),
      },
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

  async archive(id: string) {
    await this.findOne(id);

    return this.prisma.contact.update({
      where: { id },
      data: {
        status: Status.ARCHIVED,
      },
    });
  }

  async enablePortalAccess(id: string) {
    const contact = await this.findOne(id);

    if (contact.portalUserId) {
      throw new ConflictException("Portal access already enabled");
    }

    // Create portal user
    const randomPassword = Math.random().toString(36).slice(-8);
    const loginId = `portal_${contact.email.split("@")[0]}_${Math.random().toString(36).slice(-4)}`;

    const portalUser = await this.prisma.user.create({
      data: {
        loginId,
        email: contact.email,
        password: randomPassword, // Should be hashed in production
        name: contact.name,
        role: "PORTAL_USER",
      },
    });

    // Link to contact
    const updated = await this.prisma.contact.update({
      where: { id },
      data: {
        isPortalUser: true,
        portalUserId: portalUser.id,
      },
    });

    // Send portal invitation email
    this.mailService
      .sendWelcomeEmail(contact.email, contact.name)
      .catch((error) => {
        console.error(
          "[ContactsService] Failed to send portal invitation:",
          error,
        );
      });

    return {
      contact: updated,
      credentials: { loginId, password: randomPassword },
    };
  }

  private async handleTags(tagNames: string[]) {
    const tagConnections = [];

    for (const tagName of tagNames) {
      // Try to find existing tag or create new one
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

  private generateRandomColor(): string {
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
}
