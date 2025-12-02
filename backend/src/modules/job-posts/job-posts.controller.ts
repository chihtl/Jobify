import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateJobPostDto } from './dto/create-job-post.dto';
import { JobPostFilterDto } from './dto/job-post-filter.dto';
import { UpdateJobPostDto } from './dto/update-job-post.dto';
import { JobPostsService } from './job-posts.service';

@ApiTags('Job Posts')
@Controller('job-posts')
@UseGuards(JwtAuthGuard)
export class JobPostsController {
  constructor(private readonly jobPostsService: JobPostsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new job post' })
  @ApiResponse({
    status: 201,
    description: 'Job post created successfully',
  })
  async create(@Body() createJobPostDto: CreateJobPostDto) {
    return this.jobPostsService.create(createJobPostDto);
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all job posts with advanced filtering and search',
  })
  @ApiResponse({
    status: 200,
    description: 'Job posts retrieved successfully',
  })
  async findAll(@Query() filterDto: JobPostFilterDto) {
    return this.jobPostsService.findAll(filterDto);
  }

  @Get('admin')
  @Public()
  @ApiOperation({
    summary: 'Get all job posts with advanced filtering and search',
  })
  @ApiResponse({
    status: 200,
    description: 'Job posts retrieved successfully',
  })
  async findAllByAdmin(@Query() filterDto: JobPostFilterDto) {
    return this.jobPostsService.findAllByAdmin(filterDto);
  }

  @Get('search-suggestions')
  @Public()
  @ApiOperation({ summary: 'Get job title suggestions for search' })
  @ApiQuery({ name: 'q', description: 'Search query' })
  @ApiResponse({
    status: 200,
    description: 'Search suggestions retrieved successfully',
  })
  async getSearchSuggestions(@Query('q') query: string) {
    return this.jobPostsService.searchSuggestions(query);
  }

  @Get('company/:companyId')
  @Public()
  @ApiOperation({ summary: 'Get job posts by company ID' })
  @ApiParam({ name: 'companyId', description: 'Company ID' })
  @ApiResponse({
    status: 200,
    description: 'Company job posts retrieved successfully',
  })
  async findByCompany(
    @Param('companyId') companyId: string,
    @Query() filterDto: JobPostFilterDto,
  ) {
    return this.jobPostsService.findByCompany(companyId, filterDto);
  }

  @Get('company/:companyId/stats')
  @Public()
  @ApiOperation({ summary: 'Get job statistics for a company' })
  @ApiParam({ name: 'companyId', description: 'Company ID' })
  @ApiResponse({
    status: 200,
    description: 'Company job statistics retrieved successfully',
  })
  async getCompanyStats(@Param('companyId') companyId: string) {
    return this.jobPostsService.getStatsByCompany(companyId);
  }

  @Get('expired')
  @Public()
  @ApiOperation({ summary: 'Get expired job posts' })
  @ApiResponse({
    status: 200,
    description: 'Expired job posts retrieved successfully',
  })
  async findExpiredJobs() {
    return this.jobPostsService.findExpiredJobs();
  }

  @Post('deactivate-expired')
  @Public()
  @ApiOperation({ summary: 'Deactivate all expired job posts' })
  @ApiResponse({
    status: 200,
    description: 'Expired job posts deactivated successfully',
  })
  async deactivateExpiredJobs() {
    const count = await this.jobPostsService.deactivateExpiredJobs();
    return { message: `${count} expired job posts deactivated` };
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get job post by ID' })
  @ApiParam({ name: 'id', description: 'Job post ID' })
  @ApiResponse({
    status: 200,
    description: 'Job post retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Job post not found' })
  async findOne(@Param('id') id: string) {
    return this.jobPostsService.findOne(id);
  }

  @Patch(':id')
  @Public()
  @ApiOperation({ summary: 'Update job post by ID' })
  @ApiParam({ name: 'id', description: 'Job post ID' })
  @ApiResponse({
    status: 200,
    description: 'Job post updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Job post not found' })
  async update(
    @Param('id') id: string,
    @Body() updateJobPostDto: UpdateJobPostDto,
  ) {
    return this.jobPostsService.update(id, updateJobPostDto);
  }

  @Patch(':id/toggle-active')
  @Public()
  @ApiOperation({ summary: 'Toggle job post active status' })
  @ApiParam({ name: 'id', description: 'Job post ID' })
  @ApiResponse({
    status: 200,
    description: 'Job post status toggled successfully',
  })
  @ApiResponse({ status: 404, description: 'Job post not found' })
  async toggleActive(@Param('id') id: string) {
    return this.jobPostsService.toggleActive(id);
  }

  @Delete(':id')
  @Public()
  @ApiOperation({ summary: 'Delete job post by ID' })
  @ApiParam({ name: 'id', description: 'Job post ID' })
  @ApiResponse({ status: 200, description: 'Job post deleted successfully' })
  @ApiResponse({ status: 404, description: 'Job post not found' })
  async remove(@Param('id') id: string) {
    await this.jobPostsService.remove(id);
    return { message: 'Job post deleted successfully' };
  }
}
