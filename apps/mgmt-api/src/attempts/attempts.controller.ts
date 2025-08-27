import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AttemptsService } from './attempts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LocationGuard } from '../auth/location.guard';
import { CreateAttemptDto } from './dto';

@Controller('attempts')
@UseGuards(JwtAuthGuard)
export class AttemptsController {
  constructor(private svc: AttemptsService) {}

  @Get()
  list() {
    return this.svc.list();
  }

  @Post()
  @UseGuards(LocationGuard)
  create(@Body() body: CreateAttemptDto, @Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.svc.createAndSend(body, req.user.sub);
  }
}
