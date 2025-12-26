import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ){}

    async updateProfile(userId: string, updates: {fullname?: string; email?: string; password?: string}) {
        const user = await this.userRepository.findOneBy({id: userId});
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        if (!updates.fullname && !updates.email && !updates.password) {
            throw new Error('Debe proporcionar al menos un campo para actualizar');
        }

        if(updates.fullname) {
            user.fullname = updates.fullname;
        }

        if(updates.email) {
            const emailExists = await this.userRepository.findOneBy({ email: updates.email });
            if(emailExists && emailExists.id !== userId) {
                throw new Error('El correo ya está en uso por otro usuario');
            }
            user.email = updates.email;
        }

        if(updates.password) {
            user.password_hash = await bcrypt.hash(updates.password, 10);
            // Faltaria agregar validaciones de seguridad para la nueva contraseña
        }
        await this.userRepository.save(user);
        return { message: 'Perfil actualizado correctamente' };
    }

    async findById(userId: string): Promise<User | null> {
        return this.userRepository.findOneBy({id: userId});
    }
}