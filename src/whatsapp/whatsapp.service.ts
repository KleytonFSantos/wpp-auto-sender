import { Injectable } from '@nestjs/common';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';
import { create, Whatsapp, SocketState } from 'venom-bot';

type QRCode = {
  base64Qrimg: string;
};

@Injectable()
export class WhatsappService {
  private client: Whatsapp;
  public isConnected: boolean;
  public qrCode: QRCode;

  constructor() {
    this.initialize();
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
