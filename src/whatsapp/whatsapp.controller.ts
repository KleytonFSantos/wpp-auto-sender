import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { sendMessage } from './send-message';

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
  async getStatus(@Res() res) {
    const status = this.whatsappService.qrCode;
    const connected = this.whatsappService.isConnected;
    return res.status(200).json({
      qrCode: status,
      connected: connected,
    });
  }
}
