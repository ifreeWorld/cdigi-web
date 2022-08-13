import { Injectable } from '@nestjs/common';
import { InjectRedis, DEFAULT_REDIS_NAMESPACE } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { CreateConfigDto } from './config.dto';

@Injectable()
export class ConfigService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async get(key: string) {
    const res = await this.redis.get(key);
    return res;
  }

  async set({ key, value }: CreateConfigDto) {
    return await this.redis.set(key, value);
  }
}
