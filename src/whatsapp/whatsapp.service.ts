import { Injectable } from '@nestjs/common';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';
import { create, Whatsapp, SocketState } from 'venom-bot';
import { isToday } from 'date-fns';
import { PrismaService } from '../database/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs';
import * as buffer from 'buffer';

type QRCode = {
  base64Qrimg: string;
};

@Injectable()
export class WhatsappService {
  private client: Whatsapp;
  public isConnected: boolean;
  public qrCode: QRCode;

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async logThisToMe() {
    const messages = await this.prisma.message.findMany();
    messages.map(async (item) => {
      const messageDueDate = new Date(item.dueDateTime);
      if (
        this.isConnected &&
        item.status === 'WAITING' &&
        isToday(messageDueDate)
      ) {
        const checkDate =
          messageDueDate.getHours() + 3 === new Date().getHours() &&
          messageDueDate.getMinutes() === new Date().getMinutes();

        if (checkDate) {
          this.sendText(item.phoneNumber, item.message);
          await this.updateStatusMessage(item.id);
        }
      }
    });
  }

  async updateStatusMessage(id: number) {
    await this.prisma.message.update({
      where: { id: id },
      data: { status: 'SENT' },
    });
  }

  async sendText(to: string, body: string) {
    let number = to;
    if (number.length >= 13) {
      const numberArr = number.split('');
      numberArr.splice(4, 1);
      number = numberArr.join('');
    }
    if (!isValidPhoneNumber(number, 'BR')) {
      throw new Error('Invalid phone number');
    }
    let phoneNumber = parsePhoneNumber(number, 'BR')
      ?.format('E.164')
      .replace('+', '') as unknown as string;

    phoneNumber = phoneNumber.includes('@c.us')
      ? phoneNumber
      : `${phoneNumber}@c.us`;

    await this.client
      .sendText(phoneNumber, body)
      .then((response) => {
        console.log(response);
      })
      .catch((err) => {
        console.log('error', err);
      });
  }

  async initialize() {
    const qr = (base64Qrimg: string) => {
      this.qrCode = { base64Qrimg };
      const matches = base64Qrimg.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {} as any;

      if (matches.length !== 3) {
        return new Error('Invalid input string');
      }

      response.type = matches[1];
      response.data = buffer.Buffer.from(matches[2], 'base64');

      const imageBuffer = response;

      fs.writeFile('out.png', imageBuffer['data'], 'binary', (err) => {
        if (err != null) console.log(err);
      });
    };

    const statusMessage = (statusSession: string) => {
      this.isConnected = [
        'isLogged',
        'qrReadSuccess',
        'chatsAvailable',
      ].includes(statusSession);
    };

    const start = (client: Whatsapp) => {
      this.client = client;

      client.onStateChange((state) => {
        this.isConnected = state === SocketState.CONNECTED;
      });
    };

    create('test-sender', qr, statusMessage)
      .then((client) => start(client))
      .catch((err) => console.log(err));
  }
}
