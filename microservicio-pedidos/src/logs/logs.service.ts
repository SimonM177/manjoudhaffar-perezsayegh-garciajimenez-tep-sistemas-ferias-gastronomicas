import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log } from './entities/log.entity';

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(Log) private readonly repo: Repository<Log>,
  ) {}

  async createLog(action: string, channel: 'HTTP' | 'RPC', userId: string | null, statusCode: number, message: string) {
    const log = this.repo.create({ action, channel, userId: userId ?? null, statusCode, message, timestamp: new Date() });
    return this.repo.save(log);
  }
}