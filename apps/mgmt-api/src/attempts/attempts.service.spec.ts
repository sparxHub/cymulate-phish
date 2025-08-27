import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { HttpService } from '@nestjs/axios';
import { AttemptsService } from './attempts.service';
import { Attempt } from './attempt.schema';
import { of } from 'rxjs';

describe('AttemptsService', () => {
  let service: AttemptsService;

  const mockAttemptModel = {
    find: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    save: jest.fn(),
    updateOne: jest.fn(),
  };

  const mockHttpService = {
    post: jest.fn(),
  };

  beforeEach(async () => {
    // Set environment variables for the test
    process.env.SIM_API_URL = 'http://localhost:4001';
    process.env.SIM_INTERNAL_TOKEN = 'test-token';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttemptsService,
        {
          provide: getModelToken(Attempt.name),
          useValue: mockAttemptModel,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<AttemptsService>(AttemptsService);

    // Reset mocks
    mockAttemptModel.find.mockReturnThis();
    mockAttemptModel.sort.mockReturnThis();
    mockAttemptModel.limit.mockReturnThis();
    mockAttemptModel.lean.mockReset();
    mockAttemptModel.create.mockReset();
    mockAttemptModel.findById.mockReset();
    mockAttemptModel.save.mockReset();
    mockAttemptModel.updateOne.mockReset();
    mockHttpService.post.mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should list attempts', async () => {
    const mockAttempts = [
      { id: 'attempt-1', recipientEmail: 'test@example.com' },
    ];
    mockAttemptModel.lean.mockResolvedValue(mockAttempts);

    const result = await service.list();

    expect(result).toEqual(mockAttempts);
    expect(mockAttemptModel.find).toHaveBeenCalled();
    expect(mockAttemptModel.sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(mockAttemptModel.limit).toHaveBeenCalledWith(50);
  });

  it('should create an attempt', async () => {
    const dto = { recipientEmail: 'test@example.com' };
    const validUserId = '507f1f77bcf86cd799439011';
    const mockAttempt = { _id: 'attempt-id', ...dto, createdBy: validUserId };

    mockAttemptModel.create.mockResolvedValue(mockAttempt);
    mockAttemptModel.findById.mockReturnThis();
    mockAttemptModel.lean.mockResolvedValue(mockAttempt);

    // Mock HttpService post to return Observable
    mockHttpService.post.mockReturnValue(
      of({
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      }),
    );

    const result = await service.createAndSend(dto, validUserId);

    expect(result).toEqual(mockAttempt);
    expect(mockAttemptModel.create).toHaveBeenCalled();
  });
});
