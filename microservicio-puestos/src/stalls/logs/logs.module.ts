import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ApiLog } from "./entities/api-log.entity";
import { LogsService } from "./logs.service";

@Module({
    imports: [TypeOrmModule.forFeature([ApiLog])],
    providers: [LogsService],
    exports: [LogsService],
})

export class LogsModule {}