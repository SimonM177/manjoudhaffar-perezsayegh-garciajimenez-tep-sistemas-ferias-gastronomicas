import { IsBoolean, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class UpdateProductDto {

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    category?: string;

    @IsNumber()
    @IsOptional()
    @Min(0.01)
    price?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    stock?: number;

    @IsBoolean()
    @IsOptional()
    isAvailable?: boolean;

    
}