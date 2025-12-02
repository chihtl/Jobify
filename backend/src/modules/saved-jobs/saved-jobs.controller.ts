import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/auth.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateSavedJobDto } from './dto/create-saved-job.dto';
import { SavedJobsService } from './saved-jobs.service';
import { UserActiveGuard } from 'src/common/guards/user-active.guard';

@ApiTags('Saved Jobs')
@Controller('saved-jobs')
@UseGuards(JwtAuthGuard, UserActiveGuard)
export class SavedJobsController {
  constructor(private readonly savedJobsService: SavedJobsService) { }

  @Post()
  @Public()
  @ApiOperation({ summary: 'Save a job for later' })
  @ApiResponse({
    status: 201,
    description: 'Job saved successfully',
  })
  @ApiResponse({ status: 409, description: 'Job is already saved by this user' })
  async saveJob(@Body() createSavedJobDto: CreateSavedJobDto, @Request() request: Request) {
    const user = (request as any).user;
    return this.savedJobsService.saveJob(createSavedJobDto);
  }

  @Post('toggle')
  @Public()
  @ApiOperation({ summary: 'Toggle save/unsave a job' })
  @ApiQuery({ name: 'userId', description: 'User ID' })
  @ApiQuery({ name: 'jobPostId', description: 'Job post ID' })
  @ApiResponse({
    status: 200,
    description: 'Job save status toggled successfully',
  })
  async toggleSaveJob(
    @Query('userId') userId: string,
    @Query('jobPostId') jobPostId: string,
  ) {
    return this.savedJobsService.toggleSaveJob(userId, jobPostId);
  }

  @Get('user/:userId')
  @Public()
  @ApiOperation({ summary: 'Get saved jobs by user ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'User saved jobs retrieved successfully',
  })
  async findByUser(
    @Param('userId') userId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.savedJobsService.findByUser(userId, paginationDto);
  }

  @Get('user/:userId/stats')
  @Public()
  @ApiOperation({ summary: 'Get saved jobs statistics for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User saved jobs statistics retrieved successfully',
  })
  async getUserStats(@Param('userId') userId: string) {
    return this.savedJobsService.getStatsByUser(userId);
  }

  @Get('user/:userId/job-ids')
  @Public()
  @ApiOperation({ summary: 'Get list of saved job IDs for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User saved job IDs retrieved successfully',
  })
  async getSavedJobIds(@Param('userId') userId: string) {
    const jobIds = await this.savedJobsService.getSavedJobIds(userId);
    return { savedJobIds: jobIds };
  }

  @Get('check-saved')
  @Public()
  @ApiOperation({ summary: 'Check if a job is saved by a user' })
  @ApiQuery({ name: 'userId', description: 'User ID' })
  @ApiQuery({ name: 'jobPostId', description: 'Job post ID' })
  @ApiResponse({
    status: 200,
    description: 'Job save status check result',
  })
  async checkIfJobSaved(
    @Query('userId') userId: string,
    @Query('jobPostId') jobPostId: string,
  ) {
    const isSaved = await this.savedJobsService.checkIfJobSaved(userId, jobPostId);
    return { isSaved };
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get saved job by ID' })
  @ApiParam({ name: 'id', description: 'Saved job ID' })
  @ApiResponse({
    status: 200,
    description: 'Saved job retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Saved job not found' })
  async findOne(@Param('id') id: string) {
    return this.savedJobsService.findOne(id);
  }

  @Delete('unsave')
  @Public()
  @ApiOperation({ summary: 'Unsave a job' })
  @ApiQuery({ name: 'userId', description: 'User ID' })
  @ApiQuery({ name: 'jobPostId', description: 'Job post ID' })
  @ApiResponse({ status: 200, description: 'Job unsaved successfully' })
  @ApiResponse({ status: 404, description: 'Saved job not found' })
  async unsaveJob(
    @Query('userId') userId: string,
    @Query('jobPostId') jobPostId: string,
  ) {
    await this.savedJobsService.unsaveJob(userId, jobPostId);
    return { message: 'Job unsaved successfully' };
  }

  @Delete(':id')
  @Public()
  @ApiOperation({ summary: 'Delete saved job by ID' })
  @ApiParam({ name: 'id', description: 'Saved job ID' })
  @ApiResponse({ status: 200, description: 'Saved job deleted successfully' })
  @ApiResponse({ status: 404, description: 'Saved job not found' })
  async remove(@Param('id') id: string) {
    await this.savedJobsService.remove(id);
    return { message: 'Saved job deleted successfully' };
  }
}