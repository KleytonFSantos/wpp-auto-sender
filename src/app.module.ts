import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { MessageModule } from './message/message.module';

@Module({
  imports: [WhatsappModule, ScheduleModule.forRoot(), MessageModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
