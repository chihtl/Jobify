import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { PaginatedResponse, PaginationDto } from '../../common/dto/pagination.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company, CompanyDocument } from './schemas/company.schema';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
  ) { }

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    try {
      const hashedPassword = await bcrypt.hash(createCompanyDto.password, 10);

      // Loại bỏ password và chỉ lưu passwordHash
      const { password, ...companyData } = createCompanyDto;

      const newCompany = new this.companyModel({
        ...companyData,
        passwordHash: hashedPassword,
      });

      return await newCompany.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Email already exists');
      }
      throw new BadRequestException('Failed to create company');
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponse<Company>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [companies, totalItems] = await Promise.all([
      this.companyModel
        .find()
        .select('-passwordHash')
        .skip(skip)
        .limit(limit)
        .exec(),
      this.companyModel.countDocuments().exec(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: companies,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.companyModel
      .findById(id)
      .select('-passwordHash')
      .exec();

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async findByEmail(email: string): Promise<Company | null> {
    return this.companyModel.findOne({ email }).exec();
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto): Promise<Company> {
    try {
      const company = await this.companyModel
        .findByIdAndUpdate(id, updateCompanyDto, { new: true })
        .select('-passwordHash')
        .exec();

      if (!company) {
        throw new NotFoundException('Company not found');
      }

      return company;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.companyModel.deleteOne({ _id: id }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('Company not found');
    }
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await this.companyModel
      .updateOne({ _id: id }, { passwordHash: hashedPassword })
      .exec();

    if (result.matchedCount === 0) {
      throw new NotFoundException('Company not found');
    }
  }

  async searchByName(query: string, paginationDto: PaginationDto): Promise<PaginatedResponse<Company>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const searchRegex = new RegExp(query, 'i');
    const filter = {
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { location: searchRegex },
      ],
    };

    const [companies, totalItems] = await Promise.all([
      this.companyModel
        .find(filter)
        .select('-passwordHash')
        .skip(skip)
        .limit(limit)
        .exec(),
      this.companyModel.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: companies,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }
}