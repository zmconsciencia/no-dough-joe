import {
  Body,
  Controller,
  Get,
  Header,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { SalaryService } from './salary.service';

class SetSalaryDto {
  @IsOptional()
  @IsString()
  month?: string; // 'YYYY-MM' or any date in that month; defaults to now

  @IsNumber()
  @Min(0)
  amount!: number;
}

@Controller('api/salary')
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}

  // Set salary for month..Dec of that year (create or update behind the scenes)
  @Post('set')
  async set(@Req() req: Request, @Body() dto: SetSalaryDto) {
    const user = req.user as { id: string };
    return this.salaryService.setForYearRemainder(
      user.id,
      dto.month,
      dto.amount,
    );
  }

  // Read current month’s salary (or a specific month via ?month=YYYY-MM)
  @Get('current')
  @Header('cache-control', 'no-store')
  getCurrent(@Req() req: Request, @Query('month') month?: string) {
    const user = req.user as { id: string };
    return this.salaryService.getForMonth(user.id, month);
  }
}
