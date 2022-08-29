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

  async hget(key: string, creatorId: string) {
    const res = await this.redis.hget(key, creatorId);
    return res;
  }

  async hset({ key, value }: CreateConfigDto, creatorId: string) {
    const current = await this.redis.hgetall(key);
    return await this.redis.hset(key, {
      ...current,
      [creatorId]: value,
    });
  }
}
