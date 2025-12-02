import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import {
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/auth.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserActiveGuard } from '../../common/guards/user-active.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, UserActiveGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
  })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.usersService.findAll(paginationDto);
  }

  @Get('candidates/search')
  @Public()
  @ApiOperation({
    summary: 'Search candidates with vector similarity and filters',
  })
  @ApiQuery({
    name: 'query',
    required: false,
    type: String,
    description: 'Search query for vector similarity',
  })
  @ApiQuery({
    name: 'skillIds',
    required: false,
    type: [String],
    description: 'Array of skill IDs to filter by',
  })
  @ApiQuery({
    name: 'experienceTitle',
    required: false,
    type: String,
    description: 'Experience title to filter by',
  })
  @ApiQuery({
    name: 'experienceCompany',
    required: false,
    type: String,
    description: 'Experience company to filter by',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    type: String,
    description: 'Location to filter by',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Candidates retrieved successfully',
    type: [UserResponseDto],
  })
  async searchCandidates(@Query() searchParams: any) {
    return await this.usersService.searchCandidates(searchParams);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Public()
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Public()
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
    return { message: 'User deleted successfully' };
  }

  @Post(':id/upload-avatar')
  @Public()
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const userId = req.params.id;
          const uploadPath = path.join(
            process.cwd(),
            'assets',
            'users',
            userId,
            'avatar',
          );

          // Create directory if it doesn't exist
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }

          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const fileExtension = path.extname(file.originalname);
          const fileName = `avatar${fileExtension}`;
          cb(null, fileName);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Allow only image files
        const allowedMimes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'image/webp',
        ];

        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed'), false);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  )
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Avatar uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async uploadAvatar(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    // Generate the file URL
    const fileUrl = `/users/${id}/avatar/${file.filename}`;

    // Update user's avatarUrl in database
    await this.usersService.update(id, { avatarUrl: fileUrl });

    return {
      message: 'Avatar uploaded successfully',
      fileUrl,
      fileName: file.filename,
      fileSize: file.size,
    };
  }

  @Post(':id/upload-resume')
  @Public()
  @UseInterceptors(
    FileInterceptor('resume', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const userId = req.params.id;
          const uploadPath = path.join(
            process.cwd(),
            'assets',
            'users',
            userId,
            'resume',
          );

          // Create directory if it doesn't exist
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }

          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const fileExtension = path.extname(file.originalname);
          const fileName = `resume${fileExtension}`;
          cb(null, fileName);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Allow only PDF, DOC, DOCX files
        const allowedMimes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Only PDF, DOC, and DOCX files are allowed'), false);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  )
  @ApiOperation({ summary: 'Upload user resume' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Resume uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async uploadResume(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    // Generate the file URL
    const fileUrl = `/users/${id}/resume/${file.filename}`;

    // Update user's resumeUrl in database
    await this.usersService.update(id, { resumeUrl: fileUrl });

    // Generate and update embedding from PDF text (async, don't wait)
    const fullFilePath = path.join(
      process.cwd(),
      'assets',
      'users',
      id,
      'resume',
      file.filename,
    );

    // Update embedding in background (don't block the response)
    this.usersService.updateUserEmbedding(id, fullFilePath).catch((error) => {
      console.error('Failed to update user embedding:', error.message);
    });

    return {
      message: 'Resume uploaded successfully',
      fileUrl,
      fileName: file.filename,
      fileSize: file.size,
    };
  }

  @Get(':id/avatar/:filename')
  @Public()
  @ApiOperation({ summary: 'Get user avatar' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiParam({ name: 'filename', description: 'Avatar filename' })
  @ApiResponse({ status: 200, description: 'Avatar file' })
  @ApiResponse({ status: 404, description: 'File not found' })
  getAvatar(
    @Param('id') id: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const filePath = path.join(
      process.cwd(),
      'assets',
      'users',
      id,
      'avatar',
      filename,
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Set appropriate headers for images
    const fileExtension = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';

    switch (fileExtension) {
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

    return res.sendFile(filePath);
  }

  @Get(':id/resume/:filename')
  @Public()
  @ApiOperation({ summary: 'Download user resume' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiParam({ name: 'filename', description: 'Resume filename' })
  @ApiResponse({ status: 200, description: 'Resume file' })
  @ApiResponse({ status: 404, description: 'File not found' })
  downloadResume(
    @Param('id') id: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const filePath = path.join(
      process.cwd(),
      'assets',
      'users',
      id,
      'resume',
      filename,
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Set appropriate headers
    const fileExtension = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';

    switch (fileExtension) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.doc':
        contentType = 'application/msword';
        break;
      case '.docx':
        contentType =
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    return res.sendFile(filePath);
  }
}
