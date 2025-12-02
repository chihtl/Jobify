import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import {
  PaginatedResponse,
  PaginationDto,
} from '../../common/dto/pagination.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Admin, AdminDocument } from './schemas/admin.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Company } from '../companies/schemas/company.schema';
import { AdminRole } from '../../common/enums';

@Injectable()
export class AdminsService {
  private readonly logger = new Logger(AdminsService.name);

  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel('Company') private companyModel: Model<Company>,
    // eslint-disable-next-line prettier/prettier
  ) {}

  async create(createAdminDto: CreateAdminDto): Promise<Admin> {
    try {
      const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);

      const newAdmin = new this.adminModel({
        ...createAdminDto,
        passwordHash: hashedPassword,
      });

      const savedAdmin = await newAdmin.save();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      return this.findOne((savedAdmin._id as any).toString());
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === 11000) {
        throw new ConflictException('Email already exists');
      }
      throw new BadRequestException('Failed to create admin');
    }
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<Admin>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [admins, totalItems] = await Promise.all([
      this.adminModel
        .find()
        .select('-passwordHash')
        .skip(skip)
        .limit(limit)
        .exec(),
      this.adminModel.countDocuments().exec(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: admins,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<Admin> {
    const admin = await this.adminModel
      .findById(id)
      .select('-passwordHash')
      .exec();

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return admin;
  }

  async findByEmail(email: string): Promise<Admin | null> {
    return this.adminModel.findOne({ email }).exec();
  }

  async update(id: string, updateAdminDto: UpdateAdminDto): Promise<Admin> {
    try {
      const admin = await this.adminModel
        .findByIdAndUpdate(id, updateAdminDto, { new: true })
        .select('-passwordHash')
        .exec();

      if (!admin) {
        throw new NotFoundException('Admin not found');
      }

      return admin;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === 11000) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.adminModel.deleteOne({ _id: id }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('Admin not found');
    }
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await this.adminModel
      .updateOne({ _id: id }, { passwordHash: hashedPassword })
      .exec();

    if (result.matchedCount === 0) {
      throw new NotFoundException('Admin not found');
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getSystemStats(): Promise<any> {
    // This would typically import and use other services
    // For now, we'll return a placeholder structure
    return {
      users: {
        total: 0,
        newThisMonth: 0,
      },
      companies: {
        total: 0,
        newThisMonth: 0,
      },
      jobPosts: {
        total: 0,
        active: 0,
        newThisMonth: 0,
      },
      applications: {
        total: 0,
        pending: 0,
        newThisMonth: 0,
      },
      categories: {
        total: 0,
      },
      skills: {
        total: 0,
      },
    };
  }

  // User management methods
  async getAllUsers(): Promise<User[]> {
    try {
      return this.userModel
        .find()
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('Failed to get all users');
    }
  }

  async getAllAdmins(): Promise<Admin[]> {
    return this.adminModel
      .find()
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .exec();
  }

  async toggleUserActive(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, { isActive: !user.isActive }, { new: true })
      .select('-passwordHash')
      .exec();

    return updatedUser!;
  }

  async updateAdminRole(adminId: string, role: AdminRole): Promise<Admin> {
    const admin = await this.adminModel
      .findByIdAndUpdate(adminId, { role }, { new: true })
      .select('-passwordHash')
      .exec();

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return admin;
  }

  async getAllCompanies(): Promise<Company[]> {
    try {
      return this.companyModel
        .find()
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('Failed to get all companies');
    }
  }

  async toggleCompanyVerify(companyId: string): Promise<Company> {
    const company = await this.companyModel.findById(companyId).exec();
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const updatedCompany = await this.companyModel
      .findByIdAndUpdate(
        companyId,
        { isVerified: !company.isVerified },
        { new: true },
      )
      .select('-passwordHash')
      .exec();

    return updatedCompany!;
  }

  async toggleCompanyActive(companyId: string): Promise<Company> {
    const company = await this.companyModel.findById(companyId).exec();
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const updatedCompany = await this.companyModel
      .findByIdAndUpdate(
        companyId,
        { isActive: !company.isActive },
        { new: true },
      )
      .select('-passwordHash')
      .exec();

    return updatedCompany!;
  }
}
