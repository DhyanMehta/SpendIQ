import { Module } from "@nestjs/common";
import { ContactsService } from "./contacts.service";
import { ContactsController } from "./contacts.controller";
import { DatabaseModule } from "../../common/database/database.module";
import { MailModule } from "../mail/mail.module";

@Module({
  imports: [DatabaseModule, MailModule],
  controllers: [ContactsController],
  providers: [ContactsService],
  exports: [ContactsService],
})
export class ContactsModule {}
