import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ApiLog } from "./entities/api-log.entity";
import { Repository } from "typeorm";

@Injectable()
export class LogService {
    constructor(
        @InjectRepository(ApiLog)
        private readonly logRepository: Repository<ApiLog>,
    ) {}

    async createLog(route: string, method: string, userId: string | null, statusCode: number, message: string | null = null): Promise<void> {
        const log = this.logRepository.create({
            route,
            method,
            userId,
            statusCode,
            message
        });
        try {
            await this.logRepository.save(log);
        } catch (error) {
            console.error('Error al registrar log: ', error);
        }
    }
}