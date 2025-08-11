import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { BonusService } from './bonus.service';

class CreateBonusDto {
  @IsDateString()
  date!: string; // ISO date of the bonus

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsString()
  note?: string;
}

@Controller('api/bonus')
export class BonusController {
  constructor(private readonly bonusService: BonusService) {}

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateBonusDto) {
    const user = req.user as { id: string };
    return this.bonusService.create(user.id, dto.date, dto.amount, dto.note);
  }

  @Get('summary')
  async summary(
    @Req() req: Request,
    @Query('from') from: string,
    @Query('months', ParseIntPipe) months: number,
  ) {
    const user = req.user as { id: string };
    return this.bonusService.monthlySummary(user.id, from, months);
  }
}
