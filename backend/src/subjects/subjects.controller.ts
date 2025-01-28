import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Subjects')
// @UseGuards(JwtAuthGuard)
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new subject' })
  @ApiResponse({
    status: 201,
    description: 'Subject created successfully',
  })
  async create(@Body() createSubjectDto: CreateSubjectDto) {
    return this.subjectsService.create(createSubjectDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all subjects' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved all subjects successfully',
  })
  async findAll() {
    return this.subjectsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a subject by id' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved subject successfully',
  })
  async findOne(@Param('id') id: string) {
    return this.subjectsService.findOne(id);
  }
}
