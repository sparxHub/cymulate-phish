import { Test, TestingModule } from '@nestjs/testing';
import { AttemptsController } from './attempts.controller';
import { AttemptsService } from './attempts.service';

describe('AttemptsController', () => {
  let controller: AttemptsController;

  const mockAttemptsService = {
    list: jest.fn().mockResolvedValue([]),
    createAndSend: jest.fn().mockResolvedValue({ id: 'test-id', recipientEmail: 'test@example.com' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttemptsController],
      providers: [
        {
          provide: AttemptsService,
          useValue: mockAttemptsService,
        },
      ],
    }).compile();

    controller = module.get<AttemptsController>(AttemptsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should list attempts', async () => {
    const result = await controller.list();
    expect(result).toEqual([]);
    expect(mockAttemptsService.list).toHaveBeenCalled();
  });

  it('should create an attempt', async () => {
    const dto = { recipientEmail: 'test@example.com' };
    const req = { user: { sub: 'user-id' } };
    const result = await controller.create(dto, req);
    expect(result).toEqual({ id: 'test-id', recipientEmail: 'test@example.com' });
    expect(mockAttemptsService.createAndSend).toHaveBeenCalledWith(dto, 'user-id');
  });
});
