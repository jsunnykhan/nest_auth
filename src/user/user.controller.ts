import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthDto } from 'src/auth/dto';
import { UserService } from './user.service';

@UseGuards(AuthGuard('jwt'))
@Controller('user')
export class UserController {
  constructor(private service: UserService) {}

  @Get()
  getAllUser() {
    return this.service.getAllUser();
  }

  @Get(':id')
  getUserById(@Param('id') id: string) {
    return this.service.getUserById(id);
  }

  @Post()
  createUser(@Body() dto: AuthDto) {
    return this.service.createUser(dto);
  }

  @Patch(':id')
  updateUser(@Body() body: any, @Param('id') id: string) {
    return this.service.updateUser(body, id);
  }

  //   @Delete(':id')
  //   removeUser(@Param() id: string) {
  //     return this.service.removeUser(id);
  //   }
}
