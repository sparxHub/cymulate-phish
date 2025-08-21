import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private model: Model<UserDocument>) {}

  findByEmail(email: string) {
    return this.model.findOne({ email: email.toLowerCase() }).exec();
  }
  create(email: string, passwordHash: string) {
    return this.model.create({ email: email.toLowerCase(), passwordHash });
  }
}
