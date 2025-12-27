import { ApiLog } from "./entities/api-log.entity";
import { Repository } from "typeorm";
export declare class LogService {
    private readonly logRepository;
    constructor(logRepository: Repository<ApiLog>);
    createLog(route: string, method: string, userId: string | null, statusCode: number, message?: string | null): Promise<void>;
}
