export type Rol = 'cliente' | 'emprendedor' | 'organizador';
export declare class User {
    id: string;
    email: string;
    password_hash: string;
    role: Rol;
    fullname: string;
    created_at: Date;
    updated_at: Date;
}
