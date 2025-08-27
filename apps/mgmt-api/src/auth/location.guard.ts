import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';

interface RequestWithLocation extends Request {
  location?: LocationData;
}
import Redis from 'ioredis';

interface LocationData {
  country: string;
  region: string;
  city: string;
  ip: string;
}

@Injectable()
export class LocationGuard implements CanActivate {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  private redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithLocation>();
    const ip = req.ip || req.connection.remoteAddress || 'unknown';

    try {
      const location = await this.getLocationFromIP(ip);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      (req as any).location = location;

      // Check allowed countries from environment
      const allowedCountries = (process.env.ALLOWED_COUNTRIES || 'IL').split(
        ',',
      );
      if (!allowedCountries.includes(location.country)) {
        throw new ForbiddenException(`Access denied from ${location.country}`);
      }

      return true;
    } catch {
      throw new ForbiddenException('Location verification failed');
    }
  }

  private async getLocationFromIP(ip: string): Promise<LocationData> {
    const cacheKey = `location:${ip}`;
    const ttl = 3600; // 1 hour cache

    // Try cache first
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument
      return JSON.parse(cached);
    }

    // Fetch from external service
    const location = await this.fetchLocationFromAPI(ip);

    // Cache the result
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await this.redis.setex(cacheKey, ttl, JSON.stringify(location));

    return location;
  }

  private async fetchLocationFromAPI(ip: string): Promise<LocationData> {
    // Replace with your preferred geo-IP service
    const response = await fetch(`http://ip-api.com/json/${ip}`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = await response.json();

    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      country: data.countryCode || 'unknown',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      region: data.regionName || 'unknown',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      city: data.city || 'unknown',
      ip,
    };
  }
}
