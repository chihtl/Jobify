import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AdminsService } from '../admins/admins.service';
import { CompaniesService } from '../companies/companies.service';
import { UsersService } from '../users/users.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private companiesService: CompaniesService,
    private adminsService: AdminsService,
  ) { }

  async loginUser(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (
      !user ||
      !(await bcrypt.compare(loginDto.password, user.passwordHash))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user._id,
      email: user.email,
      type: 'user',
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: (user._id as any).toString(),
        email: user.email,
        name: user.name,
        type: 'user',
      },
    };
  }

  async loginCompany(loginDto: LoginDto): Promise<AuthResponseDto> {
    const company = await this.companiesService.findByEmail(loginDto.email);

    if (
      !company ||
      !(await bcrypt.compare(loginDto.password, company.passwordHash))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: company._id,
      email: company.email,
      type: 'company',
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: (company._id as any).toString(),
        email: company.email,
        name: company.name,
        type: 'company',
      },
    };
  }

  async loginAdmin(loginDto: LoginDto): Promise<AuthResponseDto> {
    const admin = await this.adminsService.findByEmail(loginDto.email);

    if (
      !admin ||
      !(await bcrypt.compare(loginDto.password, admin.passwordHash))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: admin._id,
      email: admin.email,
      type: 'admin',
      role: admin.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: (admin._id as any).toString(),
        email: admin.email,
        name: admin.name,
        type: 'admin',
        role: admin.role,
      },
    };
  }

  // Unified login method - tìm kiếm trong tất cả các bảng
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Thử tìm trong bảng users trước
    try {
      const user = await this.usersService.findByEmail(loginDto.email);
      if (
        user &&
        (await bcrypt.compare(loginDto.password, user.passwordHash))
      ) {
        const payload = {
          sub: user._id,
          email: user.email,
          type: 'user',
        };

        return {
          accessToken: this.jwtService.sign(payload),
          user: {
            id: (user._id as any).toString(),
            email: user.email,
            name: user.name,
            type: 'user',
          },
        };
      }
    } catch (error) {
      // Tiếp tục tìm trong bảng khác nếu không tìm thấy
    }

    // Thử tìm trong bảng companies
    try {
      const company = await this.companiesService.findByEmail(loginDto.email);
      if (
        company &&
        (await bcrypt.compare(loginDto.password, company.passwordHash))
      ) {
        const payload = {
          sub: company._id,
          email: company.email,
          type: 'company',
        };

        return {
          accessToken: this.jwtService.sign(payload),
          user: {
            id: (company._id as any).toString(),
            email: company.email,
            name: company.name,
            logoUrl: company.logoUrl,
            type: 'company',
          },
        };
      }
    } catch (error) {
      // Tiếp tục tìm trong bảng khác nếu không tìm thấy
    }

    // Cuối cùng thử tìm trong bảng admins
    try {
      const admin = await this.adminsService.findByEmail(loginDto.email);
      if (
        admin &&
        (await bcrypt.compare(loginDto.password, admin.passwordHash))
      ) {
        const payload = {
          sub: admin._id,
          email: admin.email,
          type: 'admin',
          role: admin.role,
        };

        return {
          accessToken: this.jwtService.sign(payload),
          user: {
            id: (admin._id as any).toString(),
            email: admin.email,
            name: admin.name,
            type: 'admin',
            role: admin.role,
          },
        };
      }
    } catch (error) {
      // Nếu không tìm thấy ở đâu cả
    }

    // Nếu không tìm thấy email hoặc password không khớp
    throw new UnauthorizedException('Invalid credentials');
  }

  // Helper method để check xem email đã tồn tại trong bất kỳ bảng nào chưa
  async checkEmailExists(email: string): Promise<boolean> {
    // Check trong bảng users
    try {
      const user = await this.usersService.findByEmail(email);
      if (user) return true;
    } catch (error) {
      // Continue checking other tables
    }

    // Check trong bảng companies
    try {
      const company = await this.companiesService.findByEmail(email);
      if (company) return true;
    } catch (error) {
      // Continue checking other tables
    }

    // Check trong bảng admins
    try {
      const admin = await this.adminsService.findByEmail(email);
      if (admin) return true;
    } catch (error) {
      // Email không tồn tại ở đâu cả
    }

    return false;
  }

  async validateToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async refreshToken(oldToken: string): Promise<{ accessToken: string }> {
    try {
      const decoded = this.jwtService.verify(oldToken);
      const newToken = this.jwtService.sign({
        sub: decoded.sub,
        email: decoded.email,
        type: decoded.type,
        role: decoded.role,
      });

      return { accessToken: newToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
