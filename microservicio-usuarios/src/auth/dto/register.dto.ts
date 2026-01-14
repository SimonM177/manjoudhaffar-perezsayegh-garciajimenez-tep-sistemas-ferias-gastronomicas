import { IsEmail, IsEnum, IsNotEmpty, IsString, Matches, MinLength } from "class-validator";
import type { Rol } from "src/users/entities/user.entity";

export class RegisterDTO {
    @IsNotEmpty()
    @IsString()
    @Matches(/^[a-zA-Z\s]+$/, {
        message: 'El nombre completo solo puede contener letras y espacios',
    })
    @MinLength(2)
    fullname: string;

    @IsEmail()
    email: string;

    @MinLength(8)
    password: string;

    @IsEnum(['cliente', 'emprendedor', 'organizador'])
    role: Rol;
}
