import {
  Body,
  Controller,
  Headers,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/auth.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login/user')
  @Public()
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async loginUser(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.loginUser(loginDto);
  }

  @Post('login/company')
  @Public()
  @ApiOperation({ summary: 'Company login' })
  @ApiResponse({
    status: 200,
    description: 'Company logged in successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async loginCompany(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.loginCompany(loginDto);
  }

  @Post('login/admin')
  @Public()
  @ApiOperation({ summary: 'Admin login' })
  @ApiResponse({
    status: 200,
    description: 'Admin logged in successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async loginAdmin(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.loginAdmin(loginDto);
  }

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Unified login - automatically detects user type' })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('check-email')
  @Public()
  @ApiOperation({ summary: 'Check if email exists in any table' })
  @ApiResponse({
    status: 200,
    description: 'Email check result',
    schema: {
      type: 'object',
      properties: {
        exists: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  })
  async checkEmail(@Body() body: { email: string }) {
    const exists = await this.authService.checkEmailExists(body.email);
    return {
      exists,
      message: exists ? 'Email already exists' : 'Email is available'
    };
  }

  @Post('validate')
  @Public()
  @ApiOperation({ summary: 'Validate JWT token' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Token is valid',
  })
  @ApiResponse({ status: 401, description: 'Invalid token' })
  async validateToken(@Headers('authorization') authorization: string) {
    const token = authorization?.replace('Bearer ', '');
    const payload = await this.authService.validateToken(token);
    return { valid: true, payload };
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Refresh JWT token' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
  })
  @ApiResponse({ status: 401, description: 'Invalid token' })
  async refreshToken(@Headers('authorization') authorization: string) {
    const token = authorization?.replace('Bearer ', '');
    return this.authService.refreshToken(token);
  }
}