import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ApiLog } from "./entities/api-log.entity";
import { LogService } from "./logs.service";

@Module({
    imports: [TypeOrmModule.forFeature([ApiLog])],
    providers: [LogService],
    exports: [LogService],
})
export class LogsModule {}