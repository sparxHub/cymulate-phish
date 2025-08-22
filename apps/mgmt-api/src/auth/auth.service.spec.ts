import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    // Set JWT_SECRET for tests
    process.env.JWT_SECRET = 'test-secret';
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    
    // Reset mocks
    mockUsersService.findByEmail.mockReset();
    mockUsersService.create.mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({ id: 'user-id', email: 'test@example.com' });

      const result = await service.register('test@example.com', 'password123');
      
      expect(result).toHaveProperty('token');
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockUsersService.create).toHaveBeenCalled();
    });

    it('should throw error if user exists', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ id: 'existing-user', email: 'test@example.com' });

      await expect(service.register('test@example.com', 'password123'))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should throw error if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login('test@example.com', 'password123'))
        .rejects.toThrow(UnauthorizedException);
    });
  });
});
