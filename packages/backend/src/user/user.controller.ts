import { Body, Controller, Get, Put } from '@nestjs/common';
import { User } from '../common/decorators/user.decorator';
import type { RequestUser } from '../common/types/request-user.interface';
import { UserService } from './user.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('me')
  getMe(@User() user: RequestUser) {
    return this.userService.getOrCreateMe(user);
  }

  @Put('me')
  updateMe(@User() user: RequestUser, @Body() dto: UpdateUserProfileDto) {
    return this.userService.updateProfileAndReturnUser(user.id, dto);
  }
}
