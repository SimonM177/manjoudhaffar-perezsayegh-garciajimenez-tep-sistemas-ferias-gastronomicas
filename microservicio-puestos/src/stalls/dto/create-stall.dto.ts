import { IsIn, IsNotEmpty, IsString } from "class-validator";

export class CreateStallDto {
    
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    description?: string;

    /*
    @IsIn(['pendiente', 'aprobado', 'activo'])
    status: 'pendiente' | 'aprobado' | 'activo' = 'pendiente'; */
}