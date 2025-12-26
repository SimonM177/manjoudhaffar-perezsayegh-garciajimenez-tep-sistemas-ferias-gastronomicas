import type { Rol } from "src/users/entities/user.entity";
export declare class RegisterDTO {
    fullname: string;
    email: string;
    password: string;
    role: Rol;
}
