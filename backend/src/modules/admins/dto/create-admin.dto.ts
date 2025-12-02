import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { AdminRole } from '../../../common/enums';

export class CreateAdminDto {
  @ApiProperty({
    description: 'Admin email address',
    example: 'admin@jobify.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Admin password',
    minLength: 6,
    example: 'password123',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({
    description: 'Admin role',
    enum: AdminRole,
    example: AdminRole.MODERATOR,
  })
  @IsOptional()
  @IsEnum(AdminRole)
  role?: AdminRole;

  @ApiPropertyOptional({
    description: 'Admin full name',
    example: 'John Admin',
  })
  @IsOptional()
  @IsString()
  name?: string;
}