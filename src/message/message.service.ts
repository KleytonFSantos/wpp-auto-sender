import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}
  async create(createMessageDto: CreateMessageDto) {
    console.log(createMessageDto);

    const date = new Date(createMessageDto.dueDate);
    await this.prisma.message.create({
      data: {
        phoneNumber: createMessageDto.phoneNumber,
        message: createMessageDto.message,
        dueDateTime: date,
      },
    });
  }

  async findAll() {
    const messages = await this.prisma.message.findMany({
      orderBy: {
        dueDateTime: 'desc',
      },
    });

    return messages;
  }

  async findOne(id: any) {
    console.log(id);
    const message = await this.prisma.message.findUnique({ where: { id: id } });

    return message;
  }

  async update(id: any, updateMessageDto: UpdateMessageDto) {
    const date = new Date(updateMessageDto.dueDate);
    await this.prisma.message.update({
      where: { id: id },
      data: {
        phoneNumber: updateMessageDto.phoneNumber,
        message: updateMessageDto.message,
        dueDateTime: date,
      },
    });
  }

  async remove(id: any) {
    await this.prisma.message.delete({ where: { id: id } });
  }
}
