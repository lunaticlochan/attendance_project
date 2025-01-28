import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { MarksService } from './marks.service';
import { CreateMarkDto } from './dto/create-mark.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Marks')
@ApiBearerAuth()
@Controller('marks')
export class MarksController {
  constructor(private readonly marksService: MarksService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create or update a mark' })
  @ApiResponse({
    status: 201,
    description: 'Mark created/updated successfully',
  })
  async create(@Body() createMarkDto: CreateMarkDto) {
    return this.marksService.create(createMarkDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all marks for a student' })
  @ApiQuery({ name: 'studentId', required: true })
  @ApiResponse({
    status: 200,
    description: 'Retrieved marks successfully',
  })
  async getStudentMarks(@Query('studentId') studentId: string) {
    return this.marksService.getStudentMarks(studentId);
  }

  @Get('percentage')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get marks percentages for all students with optional threshold filter',
  })
  @ApiQuery({
    name: 'threshold',
    required: false,
    type: Number,
    description: 'Minimum marks threshold',
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    enum: ['above', 'below'],
    description: 'Filter students above or below threshold',
  })
  @ApiQuery({
    name: 'examType',
    required: false,
    enum: ['mid1', 'mid2', 'assignment1', 'assignment2', 'quiz', 'attendance', 'weightedMid', 'total'],
    description: 'Filter by exam type or total marks',
  })
  async getMarksPercentages(
    @Query('threshold') threshold?: number,
    @Query('filter') filter?: 'above' | 'below',
    @Query('examType') examType?: 'mid1' | 'mid2' | 'assignment1' | 'assignment2' | 'quiz' | 'attendance' | 'weightedMid' | 'total',
  ) {
    return this.marksService.getMarksPercentages(threshold, filter, examType);
  }

  @Get('total')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get total marks for all students with optional filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns total marks for students',
    schema: {
      example: {
        data: [
          {
            studentId: '1',
            rollNumber: 'A123',
            name: 'John Doe',
            examMarks: {
              mid1: 18,
              mid2: 16,
              assignment1: 8,
              assignment2: 9,
              quiz: 9,
              attendance: 5
            },
            totalMarks: 85.67, // Example calculation
            weightedMidMarks: 17.33 // (max(18,16)*2/3 + min(18,16)*1/3)
          }
        ]
      }
    }
  })
  @ApiQuery({
    name: 'threshold',
    required: false,
    type: Number,
    description: 'Minimum marks threshold',
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    enum: ['above', 'below'],
    description: 'Filter students above or below threshold',
  })
  @ApiQuery({
    name: 'examType',
    required: false,
    enum: ['mid1', 'mid2', 'assignment1', 'assignment2', 'quiz', 'attendance', 'total'],
    description: 'Filter by exam type or total marks',
  })
  async getTotalMarks(
    @Query('threshold') threshold?: number,
    @Query('filter') filter?: 'above' | 'below',
    @Query('examType') examType?: 'mid1' | 'mid2' | 'assignment1' | 'assignment2' | 'quiz' | 'attendance' | 'total',
  ) {
    return this.marksService.getTotalMarks(threshold, filter, examType);
  }
} 