import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateProductDto {

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    category: string;

    @IsNumber()
    @Min(0.01)
    price: number;

    @IsInt()
    @Min(0)
    stock: number;

    @IsBoolean()
    @IsOptional()
    isAvailable?: boolean;
    
}