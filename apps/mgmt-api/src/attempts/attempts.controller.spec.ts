import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { AttemptsController } from './attempts.controller';
import { AttemptsService } from './attempts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LocationGuard } from '../auth/location.guard';

describe('AttemptsController', () => {
  let controller: AttemptsController;
  let service: AttemptsService;
  let locationGuard: LocationGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttemptsController],
      providers: [
        {
          provide: AttemptsService,
          useValue: {
            list: jest.fn(),
            createAndSend: jest.fn(),
          },
        },
        {
          provide: JwtAuthGuard,
          useValue: {
            canActivate: jest.fn().mockReturnValue(true),
          },
        },
        {
          provide: LocationGuard,
          useValue: {
            canActivate: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AttemptsController>(AttemptsController);
    service = module.get<AttemptsService>(AttemptsService);
    locationGuard = module.get<LocationGuard>(LocationGuard);
  });

  describe('POST /attempts', () => {
    it('should allow creation from Israeli IP', async () => {
      const createDto = { recipientEmail: 'test@example.com' };
      const mockReq = {
        user: { sub: 'user123' },
        location: { country: 'IL', city: 'Tel Aviv' },
      };

      (service.createAndSend as jest.Mock).mockResolvedValue({ id: '123' });
      (locationGuard.canActivate as jest.Mock).mockResolvedValue(true);

      const result = await controller.create(createDto, mockReq);

      expect(service.createAndSend).toHaveBeenCalledWith(createDto, 'user123');
      expect(result).toEqual({ id: '123' });
    });

    it('should block creation from non-Israeli IP', () => {
      (locationGuard.canActivate as jest.Mock).mockImplementation(() => {
        throw new ForbiddenException('Access denied from US');
      });

      expect(() => locationGuard.canActivate({} as any)).toThrow(
        ForbiddenException,
      );
    });
  });

  describe('GET /attempts', () => {
    it('should not apply location guard to list endpoint', async () => {
      (service.list as jest.Mock).mockResolvedValue([]);

      const result = await controller.list();

      expect(service.list).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
});
