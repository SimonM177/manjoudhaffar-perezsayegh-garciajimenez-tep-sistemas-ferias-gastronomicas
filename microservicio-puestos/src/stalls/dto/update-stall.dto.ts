import { IsIn, IsOptional, IsString } from "class-validator";

export class UpdateStallDto {

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsIn(['pendiente', 'aprobado', 'activo'])
    @IsOptional()
    status?: 'pendiente' | 'aprobado' | 'activo';

}