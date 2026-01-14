import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    @Matches(/^[a-zA-Z\s]+$/, {
        message: 'El nombre completo solo puede contener letras y espacios',
    })
    fullname?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @MinLength(8)
    password?: string;
}