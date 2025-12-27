import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { first, firstValueFrom } from "rxjs";
import { USERS_SERVICE } from "src/common/constants";
import { UpdateProfileDto } from "./dto/update-profile.dto";

@Injectable()
export class UsersService {
    constructor(
        @Inject(USERS_SERVICE)
        private readonly usersClient: ClientProxy,
    ) {}

    async getProfile(userId: string) {
        const response = await firstValueFrom(
            this.usersClient.send('users_get_profile', {userId}),
        );
        if(response.status === 'error') {
            throw new Error(response.message);
        }
        return response.data;
    }

    async updateProfile(userId: string, dto: UpdateProfileDto) {
        const response = await firstValueFrom(
            this.usersClient.send('users_update_profile', { userId, ...dto }),
        );
        if(response.status === 'error') {
            throw new Error(response.message);
        }
        return response.data;
    }
}