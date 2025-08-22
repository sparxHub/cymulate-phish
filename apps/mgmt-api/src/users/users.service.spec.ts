import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User } from './user.schema';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserModel = {
    findOne: jest.fn().mockReturnThis(),
    exec: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    
    // Reset mocks
    mockUserModel.findOne.mockReturnThis();
    mockUserModel.exec.mockReset();
    mockUserModel.create.mockReset();
    mockUserModel.save.mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find user by email', async () => {
    const mockUser = { id: 'user-id', email: 'test@example.com' };
    mockUserModel.exec.mockResolvedValue(mockUser);

    const result = await service.findByEmail('test@example.com');
    
    expect(result).toEqual(mockUser);
    expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
  });

  it('should create a user', async () => {
    const mockUser = { id: 'user-id', email: 'test@example.com', passwordHash: 'hash' };
    mockUserModel.create.mockResolvedValue(mockUser);

    const result = await service.create('test@example.com', 'hash');
    
    expect(result).toEqual(mockUser);
    expect(mockUserModel.create).toHaveBeenCalledWith({
      email: 'test@example.com',
      passwordHash: 'hash'
    });
  });
});
