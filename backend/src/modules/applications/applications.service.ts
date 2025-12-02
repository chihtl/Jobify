import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaginatedResponse } from '../../common/dto/pagination.dto';
import { ApplicationFilterDto } from './dto/application-filter.dto';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { Application, ApplicationDocument } from './schemas/application.schema';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectModel(Application.name)
    private applicationModel: Model<ApplicationDocument>,
  ) { }

  async create(
    createApplicationDto: CreateApplicationDto,
  ): Promise<Application> {
    try {
      const newApplication = new this.applicationModel(createApplicationDto);
      const savedApplication = await newApplication.save();
      return this.findOne((savedApplication._id as any).toString());
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('User has already applied to this job');
      }
      throw new BadRequestException('Failed to create application');
    }
  }

  async findAll(
    filterDto: ApplicationFilterDto,
  ): Promise<PaginatedResponse<Application>> {
    const {
      page = 1,
      limit = 10,
      userId,
      jobPostId,
      companyId,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filterDto;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = {};

    if (userId) {
      filter.userId = userId;
    }

    if (jobPostId) {
      filter.jobPostId = jobPostId;
    }

    if (status) {
      filter.status = status;
    }

    // Create aggregation pipeline for company filter
    const aggregationPipeline: any[] = [
      { $match: filter },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
          pipeline: [{ $project: { passwordHash: 0 } }],
        },
      },
      {
        $lookup: {
          from: 'job_posts',
          localField: 'jobPostId',
          foreignField: '_id',
          as: 'jobPost',
        },
      },
      { $unwind: '$user' },
      { $unwind: '$jobPost' },
    ];

    // Add company filter if provided
    if (companyId) {
      aggregationPipeline.push({
        $match: { 'jobPost.companyId': companyId },
      });
    }

    // Add lookup for company in jobPost
    aggregationPipeline.push(
      {
        $lookup: {
          from: 'companies',
          localField: 'jobPost.companyId',
          foreignField: '_id',
          as: 'jobPost.company',
          pipeline: [{ $project: { passwordHash: 0 } }],
        },
      },
      { $unwind: '$jobPost.company' },
    );

    // Add lookup for category and skills in jobPost
    aggregationPipeline.push(
      {
        $lookup: {
          from: 'categories',
          localField: 'jobPost.categoryId',
          foreignField: '_id',
          as: 'jobPost.category',
        },
      },
      {
        $lookup: {
          from: 'skills',
          localField: 'jobPost.skillIds',
          foreignField: '_id',
          as: 'jobPost.skills',
        },
      },
      {
        $unwind: {
          path: '$jobPost.category',
          preserveNullAndEmptyArrays: true,
        },
      },
    );

    // Count total items
    const countPipeline = [...aggregationPipeline, { $count: 'total' }];
    const countResult = await this.applicationModel.aggregate(countPipeline);
    const totalItems = countResult[0]?.total || 0;

    // Build sort object
    const sortObject: any = {};
    sortObject[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Add pagination
    aggregationPipeline.push(
      { $sort: sortObject },
      { $skip: skip },
      { $limit: limit },
    );

    const applications =
      await this.applicationModel.aggregate(aggregationPipeline);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: applications,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findByUser(
    userId: string,
    filterDto: ApplicationFilterDto,
  ): Promise<PaginatedResponse<Application>> {
    const updatedFilter = { ...filterDto, userId };
    return this.findAll(updatedFilter);
  }

  async findByUserSimple(userId: string): Promise<Application[]> {
    const applications = await this.applicationModel
      .find({ userId })
      .populate({
        path: 'jobPostId',
        populate: [
          { path: 'companyId', select: '-passwordHash' },
          { path: 'categoryId' },
          { path: 'skillIds' },
        ],
      })
      .select('jobPostId status createdAt message resumeUrl')
      .sort({ createdAt: -1 })
      .exec();

    return applications;
  }

  async findByJobPost(
    jobPostId: string,
    filterDto: ApplicationFilterDto,
  ): Promise<PaginatedResponse<Application>> {
    const updatedFilter = { ...filterDto, jobPostId };
    return this.findAll(updatedFilter);
  }

  async findByCompany(
    companyId: string,
    filterDto: ApplicationFilterDto,
  ): Promise<PaginatedResponse<Application>> {
    const updatedFilter = { ...filterDto, companyId };
    return this.findAll(updatedFilter);
  }

  async findOne(id: string): Promise<Application> {
    const application = await this.applicationModel
      .findById(id)
      .populate('userId', '-passwordHash')
      .populate({
        path: 'jobPostId',
        populate: [
          { path: 'companyId', select: '-passwordHash' },
          { path: 'categoryId' },
          { path: 'skillIds' },
        ],
      })
      .exec();

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateApplicationStatusDto,
  ): Promise<Application> {
    const application = await this.applicationModel
      .findByIdAndUpdate(id, { status: updateStatusDto.status }, { new: true })
      .populate('userId', '-passwordHash')
      .populate({
        path: 'jobPostId',
        populate: [
          { path: 'companyId', select: '-passwordHash' },
          { path: 'categoryId' },
          { path: 'skillIds' },
        ],
      })
      .exec();

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async remove(id: string): Promise<void> {
    const result = await this.applicationModel.deleteOne({ _id: id }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('Application not found');
    }
  }

  async checkExistingApplication(
    userId: string,
    jobPostId: string,
  ): Promise<boolean> {
    const existingApplication = await this.applicationModel
      .findOne({ userId, jobPostId })
      .exec();

    return !!existingApplication;
  }

  async getStatsByUser(userId: string): Promise<any> {
    const stats = await this.applicationModel.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      pending: 0,
      reviewed: 0,
      accepted: 0,
      rejected: 0,
      total: 0,
    };

    stats.forEach((stat: any) => {
      result[stat._id as keyof typeof result] = stat.count;
      result.total += stat.count;
    });

    return result;
  }

  async getStatsByCompany(companyId: string): Promise<any> {
    const stats = await this.applicationModel.aggregate([
      {
        $lookup: {
          from: 'job_posts',
          localField: 'jobPostId',
          foreignField: '_id',
          as: 'jobPost',
        },
      },
      { $unwind: '$jobPost' },
      { $match: { 'jobPost.companyId': companyId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      pending: 0,
      reviewed: 0,
      accepted: 0,
      rejected: 0,
      total: 0,
    };

    stats.forEach((stat: any) => {
      result[stat._id as keyof typeof result] = stat.count;
      result.total += stat.count;
    });

    return result;
  }

  async getApplicationsByCompanyDetailed(
    companyId: string,
  ): Promise<Application[]> {
    const applications = await this.applicationModel
      .find()
      .populate({
        path: 'userId',
        select: 'name email phone avatarUrl resumeUrl',
      })
      .populate({
        path: 'jobPostId',
        match: { companyId: companyId },
        populate: [
          { path: 'companyId', select: 'name logoUrl' },
          { path: 'categoryId', select: 'name' },
          { path: 'skillIds', select: 'name' },
        ],
      })
      .sort({ createdAt: -1 })
      .exec();

    // Filter out applications where jobPostId is null (job doesn't belong to company)
    return applications.filter((app) => app.jobPostId);
  }
}
