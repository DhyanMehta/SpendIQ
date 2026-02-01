import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ContactsService } from "./contacts.service";
import { CreateContactDto } from "./dto/create-contact.dto";
import { UpdateContactDto } from "./dto/update-contact.dto";
import { ContactQueryDto } from "./dto/contact-query.dto";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Role } from "@prisma/client";

@Controller("contacts")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) { }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createContactDto: CreateContactDto, @CurrentUser() user: any) {
    return this.contactsService.create(createContactDto, user.id);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll(@Query() query: ContactQueryDto, @CurrentUser() user: any) {
    return this.contactsService.findAll(query, user.id);
  }

  @Get(":id")
  @Roles(Role.ADMIN)
  findOne(@Param("id") id: string) {
    return this.contactsService.findOne(id);
  }

  @Patch(":id")
  @Roles(Role.ADMIN)
  update(@Param("id") id: string, @Body() updateContactDto: UpdateContactDto) {
    return this.contactsService.update(id, updateContactDto);
  }

  @Delete(":id")
  @Roles(Role.ADMIN)
  archive(@Param("id") id: string) {
    return this.contactsService.archive(id);
  }

  @Post(":id/portal")
  @Roles(Role.ADMIN)
  enablePortalAccess(@Param("id") id: string) {
    return this.contactsService.enablePortalAccess(id);
  }
}
