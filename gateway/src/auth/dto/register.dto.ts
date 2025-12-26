import { IsEmail, IsEnum, IsNotEmpty, MinLength } from "class-validator";

export class RegisterDTO {
    @IsNotEmpty()
    fullname: string;

    @IsEmail()
    email: string;

    @MinLength(8)
    password: string;

    @IsEnum(['cliente', 'emprendedor', 'organizador'])
    role: string;
}