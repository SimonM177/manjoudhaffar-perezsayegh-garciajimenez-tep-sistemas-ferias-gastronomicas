import { HttpException, Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { USERS_SERVICE } from "src/common/constants";
import { RegisterDTO } from "./dto/register.dto";
import { firstValueFrom } from "rxjs";
import { send } from "process";
import { LoginDTO } from "./dto/login.dto";

@Injectable()
export class AuthService {
    constructor(
        @Inject(USERS_SERVICE)
        private readonly usersClient: ClientProxy
    ) {}

    /*async register(dto: RegisterDTO) {
        return firstValueFrom(
            // this.usersClient.send({ send: 'auth_register' }, dto),
            this.usersClient.send('auth_register', dto),
        );
    }*/

    async register(dto: RegisterDTO) {
      const response = await firstValueFrom(
        this.usersClient.send('auth_register', dto),
      );

      if (response.status === 'error') {
        throw new HttpException(response.message, response.statusCode);
      }

      return response.data;
    }

    async login(dto: LoginDTO) {
        return firstValueFrom(
            // this.usersClient.send({ cmd: 'auth_login '}, dto)
            this.usersClient.send('auth_login', dto)
        );
    }
}