import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'User/Company/Admin information',
    example: {
      id: '507f1f77bcf86cd799439011',
      email: 'user@example.com',
      name: 'John Doe',
      type: 'user',
    },
  })
  user: {
    id: string;
    email: string;
    name?: string;
    logoUrl?: string;
    type: 'user' | 'company' | 'admin';
    role?: string;
  };
}
