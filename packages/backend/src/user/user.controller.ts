import { Body, Controller, Get, Put, Req } from '@nestjs/common';
import type { Request } from 'express';
import { UserService } from './user.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import type { AuthUser, UserWithProfile } from './user.types';

@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getMe(@Req() req: Request): Promise<UserWithProfile | null> {
    const user = req.user as AuthUser;
    return this.userService.getMe(user.id);
  }

  @Put('me')
  async updateMe(
    @Req() req: Request,
    @Body() dto: UpdateUserProfileDto,
  ): Promise<UserWithProfile | null> {
    const user = req.user as AuthUser;
    return await this.userService.updateProfileAndReturnUser(user.id, dto);
  }
}
