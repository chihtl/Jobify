import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
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
import { ApplicationsService } from './applications.service';
import { ApplicationFilterDto } from './dto/application-filter.dto';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { UserActiveGuard } from '../../common/guards/user-active.guard';

@ApiTags('Applications')
@Controller('applications')
@UseGuards(JwtAuthGuard, UserActiveGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Create a new job application' })
  @ApiResponse({
    status: 201,
    description: 'Application created successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'User has already applied to this job',
  })
  async create(@Body() createApplicationDto: CreateApplicationDto) {
    return this.applicationsService.create(createApplicationDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all applications with filtering' })
  @ApiResponse({
    status: 200,
    description: 'Applications retrieved successfully',
  })
  async findAll(@Query() filterDto: ApplicationFilterDto) {
    return this.applicationsService.findAll(filterDto);
  }

  @Get('user/:userId')
  @Public()
  @ApiOperation({ summary: 'Get applications by user ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User applications retrieved successfully',
  })
  async findByUser(
    @Param('userId') userId: string,
    @Query() filterDto: ApplicationFilterDto,
  ) {
    return this.applicationsService.findByUser(userId, filterDto);
  }

  @Get('user/:userId/simple')
  @Public()
  @ApiOperation({ summary: 'Get simple applications list by user ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User applications retrieved successfully',
  })
  async findByUserSimple(@Param('userId') userId: string) {
    return this.applicationsService.findByUserSimple(userId);
  }

  @Get('user/:userId/stats')
  @Public()
  @ApiOperation({ summary: 'Get application statistics for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User application statistics retrieved successfully',
  })
  async getUserStats(@Param('userId') userId: string) {
    return this.applicationsService.getStatsByUser(userId);
  }

  @Get('job-post/:jobPostId')
  @Public()
  @ApiOperation({ summary: 'Get applications by job post ID' })
  @ApiParam({ name: 'jobPostId', description: 'Job post ID' })
  @ApiResponse({
    status: 200,
    description: 'Job post applications retrieved successfully',
  })
  async findByJobPost(
    @Param('jobPostId') jobPostId: string,
    @Query() filterDto: ApplicationFilterDto,
  ) {
    return this.applicationsService.findByJobPost(jobPostId, filterDto);
  }

  @Get('company/:companyId')
  @Public()
  @ApiOperation({ summary: 'Get applications by company ID' })
  @ApiParam({ name: 'companyId', description: 'Company ID' })
  @ApiResponse({
    status: 200,
    description: 'Company applications retrieved successfully',
  })
  async findByCompany(
    @Param('companyId') companyId: string,
    @Query() filterDto: ApplicationFilterDto,
  ) {
    return this.applicationsService.findByCompany(companyId, filterDto);
  }

  @Get('company/:companyId/detailed')
  @Public()
  @ApiOperation({ summary: 'Get detailed applications by company ID' })
  @ApiParam({ name: 'companyId', description: 'Company ID' })
  @ApiResponse({
    status: 200,
    description:
      'Company applications with full details retrieved successfully',
  })
  async getApplicationsByCompanyDetailed(
    @Param('companyId') companyId: string,
  ) {
    return this.applicationsService.getApplicationsByCompanyDetailed(companyId);
  }

  @Get('company/:companyId/stats')
  @Public()
  @ApiOperation({ summary: 'Get application statistics for a company' })
  @ApiParam({ name: 'companyId', description: 'Company ID' })
  @ApiResponse({
    status: 200,
    description: 'Company application statistics retrieved successfully',
  })
  async getCompanyStats(@Param('companyId') companyId: string) {
    return this.applicationsService.getStatsByCompany(companyId);
  }

  @Get('check-existing')
  @Public()
  @ApiOperation({ summary: 'Check if user has already applied to a job' })
  @ApiQuery({ name: 'userId', description: 'User ID' })
  @ApiQuery({ name: 'jobPostId', description: 'Job post ID' })
  @ApiResponse({
    status: 200,
    description: 'Application existence check result',
  })
  async checkExisting(
    @Query('userId') userId: string,
    @Query('jobPostId') jobPostId: string,
  ) {
    const hasApplied = await this.applicationsService.checkExistingApplication(
      userId,
      jobPostId,
    );
    return { hasApplied };
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get application by ID' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({
    status: 200,
    description: 'Application retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async findOne(@Param('id') id: string) {
    return this.applicationsService.findOne(id);
  }

  @Patch(':id/status')
  @Public()
  @ApiOperation({ summary: 'Update application status' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({
    status: 200,
    description: 'Application status updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateApplicationStatusDto,
  ) {
    return this.applicationsService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  @Public()
  @ApiOperation({ summary: 'Delete application by ID' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({ status: 200, description: 'Application deleted successfully' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async remove(@Param('id') id: string) {
    await this.applicationsService.remove(id);
    return { message: 'Application deleted successfully' };
  }
}
