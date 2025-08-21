import {
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Body,
  Res,
} from '@nestjs/common';
import { PhishingService } from './phishing.service';
import express from 'express';

@Controller('phishing')
export class PhishingController {
  constructor(private svc: PhishingService) {}

  @Post('send')
  send(
    @Body('attemptId') attemptId: string,
    @Headers('x-internal-token') token: string,
  ) {
    return this.svc.send(attemptId, token);
  }

  @Get('track/:token')
  async track(@Param('token') token: string, @Res() res: express.Response) {
    await this.svc.track(token);
    return res.redirect(302, `${process.env.WEB_PUBLIC_URL}/learn`);
  }
}
