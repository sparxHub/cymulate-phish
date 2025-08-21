import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Attempt, AttemptDocument } from './attempt.schema';
import axios from 'axios';

@Injectable()
export class AttemptsService {
  constructor(
    @InjectModel(Attempt.name) private model: Model<AttemptDocument>,
  ) {}

  list() {
    return this.model.find().sort({ createdAt: -1 }).limit(50).lean();
  }

  async createAndSend(input: Partial<Attempt>, userId: string) {
    const doc = await this.model.create({
      ...input,
      status: 'CREATED',
      createdBy: new Types.ObjectId(userId),
    });

    // call Simulation API
    await axios
      .post(
        `${process.env.SIM_API_URL}/phishing/send`,
        { attemptId: String(doc._id) },
        { headers: { 'x-internal-token': process.env.SIM_INTERNAL_TOKEN! } },
      )
      .catch(async (e) => {
        await this.model.updateOne(
          { _id: doc._id },
          { $set: { status: 'FAILED', error: String(e) } },
        );
        throw e;
      });

    // sim-api will update to SENT
    return this.model.findById(doc._id).lean();
  }
}
