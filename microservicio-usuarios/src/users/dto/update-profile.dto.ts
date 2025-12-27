import { IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class UpdateProfileDto {
    @IsOptional()
    @IsNotEmpty()
    fullname?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @MinLength(8)
    password?: string;
}