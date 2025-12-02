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
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { SkillsService } from './skills.service';

@ApiTags('Skills')
@Controller('skills')
@UseGuards(JwtAuthGuard)
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) { }

  @Post()
  @Public()
  @ApiOperation({ summary: 'Create a new skill' })
  @ApiResponse({
    status: 201,
    description: 'Skill created successfully',
  })
  @ApiResponse({ status: 409, description: 'Skill name already exists' })
  async create(@Body() createSkillDto: CreateSkillDto) {
    return this.skillsService.create(createSkillDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all skills with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Skills retrieved successfully',
  })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.skillsService.findAll(paginationDto);
  }

  @Get('simple')
  @Public()
  @ApiOperation({ summary: 'Get all skills without pagination (for dropdowns)' })
  @ApiResponse({
    status: 200,
    description: 'Skills retrieved successfully',
  })
  async findAllSimple() {
    return this.skillsService.findAllSimple();
  }

  @Get('category/:categoryId')
  @Public()
  @ApiOperation({ summary: 'Get skills by category ID' })
  @ApiParam({ name: 'categoryId', description: 'Category ID' })
  @ApiResponse({
    status: 200,
    description: 'Skills retrieved successfully',
  })
  async findByCategory(@Param('categoryId') categoryId: string) {
    return this.skillsService.findByCategory(categoryId);
  }

  @Get('search')
  @Public()
  @ApiOperation({ summary: 'Search skills by name' })
  @ApiQuery({ name: 'q', description: 'Search query' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Skills search results',
  })
  async search(
    @Query('q') query: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.skillsService.searchByName(query, paginationDto);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get skill by ID' })
  @ApiParam({ name: 'id', description: 'Skill ID' })
  @ApiResponse({
    status: 200,
    description: 'Skill retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Skill not found' })
  async findOne(@Param('id') id: string) {
    return this.skillsService.findOne(id);
  }

  @Patch(':id')
  @Public()
  @ApiOperation({ summary: 'Update skill by ID' })
  @ApiParam({ name: 'id', description: 'Skill ID' })
  @ApiResponse({
    status: 200,
    description: 'Skill updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Skill not found' })
  @ApiResponse({ status: 409, description: 'Skill name already exists' })
  async update(@Param('id') id: string, @Body() updateSkillDto: UpdateSkillDto) {
    return this.skillsService.update(id, updateSkillDto);
  }

  @Delete(':id')
  @Public()
  @ApiOperation({ summary: 'Delete skill by ID' })
  @ApiParam({ name: 'id', description: 'Skill ID' })
  @ApiResponse({ status: 200, description: 'Skill deleted successfully' })
  @ApiResponse({ status: 404, description: 'Skill not found' })
  async remove(@Param('id') id: string) {
    await this.skillsService.remove(id);
    return { message: 'Skill deleted successfully' };
  }
}