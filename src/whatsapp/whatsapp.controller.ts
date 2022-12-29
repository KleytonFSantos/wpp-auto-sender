import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { sendMessage } from './dto/send-message';
import { Response } from 'express';
import * as fs from 'fs';
import { join } from 'path';

@Controller()
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Post('send-message')
  async wppMessage(@Body() payload: sendMessage, @Res() res) {
    try {
      const { number, message } = payload;
      await this.whatsappService.sendText(number, message);
      return res.status(200).json();
    } catch (err) {
      console.log(err);
      return res.status(500).json(err.message);
    }
  }

  @Get('status')
  async getStatus(@Res({ passthrough: true }) res: Response) {
    const filePath = join(__dirname, '..', '..', 'out.png');
    const connected = this.whatsappService.isConnected;

    if (!connected) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      await this.whatsappService.initialize();
    }
    while (!fs.existsSync(filePath) && !connected) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    const status = this.whatsappService.qrCode;
    res.json({
      qrCode: status,
      connected: connected,
    });
  }
}
