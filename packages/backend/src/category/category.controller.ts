import { Body, Controller, Get, Post } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './category.dto';

@Controller('api/categories')
export class CategoryController {
  constructor(private readonly svc: CategoryService) {}

  @Get()
  listAll() {
    return this.svc.list();
  }

  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.svc.create(dto);
  }
}
