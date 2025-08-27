import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { LocationGuard } from './location.guard';

jest.mock('ioredis', () => {
  return class MockRedis {
    get = jest.fn();
    setex = jest.fn();
  };
});

global.fetch = jest.fn();

describe('LocationGuard', () => {
  let guard: LocationGuard;
  let mockContext: ExecutionContext;
  let mockRedis: any;

  beforeEach(() => {
    guard = new LocationGuard();
    mockRedis = (guard as any).redis;
    
    mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          ip: '1.2.3.4',
          connection: { remoteAddress: '1.2.3.4' },
        }),
      }),
    } as ExecutionContext;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should allow Israeli IP addresses', async () => {
      process.env.ALLOWED_COUNTRIES = 'IL';
      
      mockRedis.get.mockResolvedValue(null);
      (global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve({
          countryCode: 'IL',
          regionName: 'Tel Aviv',
          city: 'Tel Aviv',
        }),
      });

      const result = await guard.canActivate(mockContext);
      
      expect(result).toBe(true);
      expect(mockRedis.setex).toHaveBeenCalledWith(
        'location:1.2.3.4',
        3600,
        expect.stringContaining('IL'),
      );
    });

    it('should block non-Israeli IP addresses', async () => {
      process.env.ALLOWED_COUNTRIES = 'IL';
      
      mockRedis.get.mockResolvedValue(null);
      (global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve({
          countryCode: 'US',
          regionName: 'California',
          city: 'San Francisco',
        }),
      });

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should use cached location data', async () => {
      process.env.ALLOWED_COUNTRIES = 'IL';
      
      const cachedLocation = JSON.stringify({
        country: 'IL',
        region: 'Tel Aviv',
        city: 'Tel Aviv',
        ip: '1.2.3.4',
      });
      
      mockRedis.get.mockResolvedValue(cachedLocation);

      const result = await guard.canActivate(mockContext);
      
      expect(result).toBe(true);
      expect(global.fetch).not.toHaveBeenCalled();
      expect(mockRedis.setex).not.toHaveBeenCalled();
    });

    it('should handle multiple allowed countries', async () => {
      process.env.ALLOWED_COUNTRIES = 'IL,US,GB';
      
      mockRedis.get.mockResolvedValue(null);
      (global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve({
          countryCode: 'US',
          regionName: 'California',
          city: 'San Francisco',
        }),
      });

      const result = await guard.canActivate(mockContext);
      
      expect(result).toBe(true);
    });

    it('should handle API errors gracefully', async () => {
      process.env.ALLOWED_COUNTRIES = 'IL';
      
      mockRedis.get.mockResolvedValue(null);
      (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
