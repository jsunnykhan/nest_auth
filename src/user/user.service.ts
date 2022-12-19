import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { access_role, Users } from '@prisma/client';
import { AuthDto } from 'src/auth/dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getAllUser() {
    try {
      const users = await this.prisma.users.findMany({
        select: {
          id: true,
          name: true,
          userName: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return users;
    } catch (error) {
      throw error;
    }
  }

  async getUserById(_id: string) {
    try {
      const id = Number(_id);
      if (isNaN(id)) throw new ForbiddenException('id not a number');

      const user = await this.prisma.users.findFirst({
        where: {
          id,
        },
        select: {
          id: true,
          name: true,
          userName: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      if (!user) throw new BadRequestException('user not found!');
      return user;
    } catch (error) {
      throw error;
    }
  }
  async getUserByName(userName: string) {
    try {
      const user = await this.prisma.users.findFirst({
        where: {
          userName,
        },
        select: {
          id: true,
          userName: true,
          hash: true,
          refreshToken: true,
        },
      });
      if (!user) throw new BadRequestException('user not found!');
      return user;
    } catch (error) {
      throw error;
    }
  }

  async createUser(dto: AuthDto) {
    try {
      //generate the password has
      const hash = await argon.hash(dto.password);
      //save this new user into the db
      const user = await this.prisma.users.create({
        data: {
          userName: dto.username,
          hash,
        },
        select: {
          id: true,
          userName: true,
        },
      });

      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credential already taken');
        }
      }
      throw error;
    }
  }

  async updateUser(body: any, _id: string) {
    try {
      const id = Number(_id);
      if (isNaN(id)) throw new ForbiddenException('id not a number');
      const updatedUser = await this.prisma.users.update({
        where: {
          id,
        },
        data: { ...body },
      });

      return updatedUser;
    } catch (error) {
      throw error;
    }
  }
}
