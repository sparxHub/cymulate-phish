import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attempt, AttemptDocument } from './attempt.schema';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class PhishingService {
  constructor(
    @InjectModel(Attempt.name) private model: Model<AttemptDocument>,
  ) {}

  private checkInternalToken(token?: string) {
    if (token !== process.env.SIM_INTERNAL_TOKEN)
      throw new UnauthorizedException('bad token');
  }

  async send(attemptId: string, tokenHeader?: string) {
    this.checkInternalToken(tokenHeader);
    const attempt = await this.model.findById(attemptId);
    if (!attempt) throw new Error('attempt not found');

    const token = crypto.randomBytes(16).toString('hex');
    const trackingUrl = `${process.env.TRACK_BASE_URL}/phishing/track/${token}`;

    // nodemailer transport (MailHog by default)
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 1025),
      secure: false,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });

    const html = attempt.body?.includes('{{trackingUrl}}')
      ? attempt.body.replace('{{trackingUrl}}', trackingUrl)
      : `<p>Hi,</p><p><a href="${trackingUrl}">View Activity</a></p>`;

    await transport.sendMail({
      from: 'IT Security <no-reply@example.com>',
      to: attempt.recipientEmail,
      subject: attempt.subject || 'Security Awareness Test',
      html,
    });

    attempt.status = 'SENT';
    attempt.token = token;
    attempt.sentAt = new Date();
    await attempt.save();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return { id: attempt.id, status: attempt.status };
  }

  async track(token: string) {
    const attempt = await this.model.findOne({ token });
    if (!attempt) return { ok: true }; // don't leak
    if (attempt.status !== 'CLICKED') {
      attempt.status = 'CLICKED';
      attempt.clickedAt = new Date();
      await attempt.save();
    }
    return { ok: true };
  }
}
