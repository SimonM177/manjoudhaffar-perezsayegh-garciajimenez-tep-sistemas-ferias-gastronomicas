import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import { STALLS_SERVICE } from "src/common/constants";

@Injectable()
export class StallsService {
    constructor(
        @Inject(STALLS_SERVICE)
        private stallsClient: ClientProxy,
    ) {}

    async createStall(ownerId: string, dto: any) {
        return firstValueFrom(
            this.stallsClient.send('stalls_create', { ownerId, stall: dto }),
        );
    }

    async findAllStalls(userId: string) {
        return firstValueFrom(
            this.stallsClient.send('stalls_find_all', { userId }),
        );
    }

    async findActiveStalls() {
        return firstValueFrom(
            this.stallsClient.send('stalls_find_active', {}),
        );
    }

    async findOneStall(userId: string, id: string) {
        return firstValueFrom(
            this.stallsClient.send('stalls_find_one', { userId, id }),
        );
    }

    async updateStall(userId: string, id: string, dto: any) {
        return firstValueFrom(
            this.stallsClient.send('stalls_update', { userId, id, stall: dto }),
        );
    }

    async approveStall(userId: string, id: string) {
        return firstValueFrom(
            this.stallsClient.send('stalls_approve', { userId, id }),
        );
    }

    async removeStall(userId: string, id: string) {
        return firstValueFrom(
            this.stallsClient.send('stalls_remove', { userId, id }),
        );
    }
}