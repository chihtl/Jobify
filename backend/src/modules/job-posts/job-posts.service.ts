import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaginatedResponse } from '../../common/dto/pagination.dto';
import { CreateJobPostDto } from './dto/create-job-post.dto';
import { JobPostFilterDto } from './dto/job-post-filter.dto';
import { UpdateJobPostDto } from './dto/update-job-post.dto';
import { JobPost, JobPostDocument } from './schemas/job-post.schema';

@Injectable()
export class JobPostsService {
  constructor(
    @InjectModel(JobPost.name) private jobPostModel: Model<JobPostDocument>,
  ) {}

  async create(createJobPostDto: CreateJobPostDto): Promise<JobPost> {
    try {
      // Đảm bảo job mới luôn có isActive = false và status = 'pending'
      const jobData = {
        ...createJobPostDto,
        isActive: false,
        status: 'pending',
      };

      const newJobPost = new this.jobPostModel(jobData);
      const savedJobPost = await newJobPost.save();
      return this.findOne((savedJobPost._id as any).toString());
    } catch (error) {
      throw new BadRequestException('Failed to create job post');
    }
  }

  async findAllByAdmin(
    filterDto: JobPostFilterDto,
  ): Promise<PaginatedResponse<JobPost>> {
    const {
      page = 1,
      limit = 10,
      search,
      companyId,
      categoryId,
      skillIds,
      location,
      jobType,
      experienceLevel,
      minSalary,
      maxSalary,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status, // Thêm filter theo status
    } = filterDto;
    console.log(filterDto);
    const skip = (page - 1) * limit;

    const filter: any = {};

    // Nếu có filter status cụ thể, override filter mặc định
    if (status) {
      filter.status = status;
      // Nếu status không phải 'approved', bỏ điều kiện isActive
      if (status !== 'approved') {
        delete filter.isActive;
      }
    }

    // Add search filter if search parameter is provided
    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    } else {
      filter.$or = [
        { title: { $regex: '', $options: 'i' } },
        { description: { $regex: '', $options: 'i' } },
      ];
    }

    if (companyId) {
      filter.companyId = companyId;
    }

    if (categoryId) {
      filter.categoryId = categoryId;
    }

    if (skillIds && skillIds.length > 0) {
      filter.skillIds = { $in: skillIds };
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (jobType) {
      filter.jobType = jobType;
    }

    if (experienceLevel) {
      filter.experienceLevel = experienceLevel;
    }

    // Salary range filter
    if (minSalary !== undefined || maxSalary !== undefined) {
      filter.$and = filter.$and || [];

      if (minSalary !== undefined && maxSalary !== undefined) {
        filter.$and.push({
          $or: [
            { salaryMin: { $gte: minSalary, $lte: maxSalary } },
            { salaryMax: { $gte: minSalary, $lte: maxSalary } },
            {
              $and: [
                { salaryMin: { $lte: minSalary } },
                { salaryMax: { $gte: maxSalary } },
              ],
            },
          ],
        });
      } else if (minSalary !== undefined) {
        filter.$and.push({
          $or: [
            { salaryMin: { $gte: minSalary } },
            { salaryMax: { $gte: minSalary } },
          ],
        });
      } else if (maxSalary !== undefined) {
        filter.$and.push({
          $or: [
            { salaryMin: { $lte: maxSalary } },
            { salaryMax: { $lte: maxSalary } },
          ],
        });
      }
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [jobPosts, totalItems] = await Promise.all([
      this.jobPostModel
        .find(filter)
        .populate('companyId', 'name logoUrl location')
        .populate('categoryId', 'name')
        .populate('skillIds', 'name')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.jobPostModel.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: jobPosts,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findAll(
    filterDto: JobPostFilterDto,
  ): Promise<PaginatedResponse<JobPost>> {
    const {
      page = 1,
      limit = 10,
      search,
      companyId,
      categoryId,
      skillIds,
      location,
      jobType,
      experienceLevel,
      minSalary,
      maxSalary,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status, // Thêm filter theo status
    } = filterDto;
    console.log(filterDto);
    const skip = (page - 1) * limit;

    // Build filter object - chỉ hiển thị job đã được duyệt cho user thường
    const filter: any = { isActive: true, status: 'approved' };

    // Nếu có filter status cụ thể, override filter mặc định
    if (status) {
      filter.status = status;
      // Nếu status không phải 'approved', bỏ điều kiện isActive
      if (status !== 'approved') {
        delete filter.isActive;
      }
    }

    // Add search filter if search parameter is provided
    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    } else {
      filter.$or = [
        { title: { $regex: '', $options: 'i' } },
        { description: { $regex: '', $options: 'i' } },
      ];
    }

    if (companyId) {
      filter.companyId = companyId;
    }

    if (categoryId) {
      filter.categoryId = categoryId;
    }

    if (skillIds && skillIds.length > 0) {
      filter.skillIds = { $in: skillIds };
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (jobType) {
      filter.jobType = jobType;
    }

    if (experienceLevel) {
      filter.experienceLevel = experienceLevel;
    }

    // Salary range filter
    if (minSalary !== undefined || maxSalary !== undefined) {
      filter.$and = filter.$and || [];

      if (minSalary !== undefined && maxSalary !== undefined) {
        filter.$and.push({
          $or: [
            { salaryMin: { $gte: minSalary, $lte: maxSalary } },
            { salaryMax: { $gte: minSalary, $lte: maxSalary } },
            {
              $and: [
                { salaryMin: { $lte: minSalary } },
                { salaryMax: { $gte: maxSalary } },
              ],
            },
          ],
        });
      } else if (minSalary !== undefined) {
        filter.$and.push({
          $or: [
            { salaryMin: { $gte: minSalary } },
            { salaryMax: { $gte: minSalary } },
          ],
        });
      } else if (maxSalary !== undefined) {
        filter.$and.push({
          $or: [
            { salaryMin: { $lte: maxSalary } },
            { salaryMax: { $lte: maxSalary } },
          ],
        });
      }
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [jobPosts, totalItems] = await Promise.all([
      this.jobPostModel
        .find(filter)
        .populate('companyId', 'name logoUrl location')
        .populate('categoryId', 'name')
        .populate('skillIds', 'name')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.jobPostModel.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: jobPosts,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findByCompany(
    companyId: string,
    filterDto: JobPostFilterDto,
  ): Promise<PaginatedResponse<JobPost>> {
    const updatedFilter = { ...filterDto, companyId };
    return this.findAllByAdmin(updatedFilter);
  }

  async findOne(id: string): Promise<JobPost> {
    const jobPost = await this.jobPostModel
      .findById(id)
      .populate('companyId', 'name logoUrl location websiteUrl description')
      .populate('categoryId', 'name description')
      .populate('skillIds', 'name')
      .exec();

    if (!jobPost) {
      throw new NotFoundException('Job post not found');
    }

    return jobPost;
  }

  async update(
    id: string,
    updateJobPostDto: UpdateJobPostDto,
  ): Promise<JobPost> {
    try {
      const jobPost = await this.jobPostModel
        .findByIdAndUpdate(id, updateJobPostDto, { new: true })
        .populate('companyId', 'name logoUrl location')
        .populate('categoryId', 'name')
        .populate('skillIds', 'name')
        .exec();

      if (!jobPost) {
        throw new NotFoundException('Job post not found');
      }

      return jobPost;
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.jobPostModel.deleteOne({ _id: id }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('Job post not found');
    }
  }

  async toggleActive(id: string): Promise<JobPost> {
    const jobPost = await this.jobPostModel.findById(id).exec();

    if (!jobPost) {
      throw new NotFoundException('Job post not found');
    }

    jobPost.isActive = !jobPost.isActive;
    await jobPost.save();

    return this.findOne(id);
  }

  async getStatsByCompany(companyId: string): Promise<any> {
    const stats = await this.jobPostModel.aggregate([
      { $match: { companyId: companyId } },
      {
        $group: {
          _id: null,
          totalJobs: { $sum: 1 },
          activeJobs: { $sum: { $cond: ['$isActive', 1, 0] } },
          inactiveJobs: { $sum: { $cond: ['$isActive', 0, 1] } },
          avgSalaryMin: { $avg: '$salaryMin' },
          avgSalaryMax: { $avg: '$salaryMax' },
        },
      },
    ]);

    return (
      stats[0] || {
        totalJobs: 0,
        activeJobs: 0,
        inactiveJobs: 0,
        avgSalaryMin: 0,
        avgSalaryMax: 0,
      }
    );
  }

  async searchSuggestions(query: string): Promise<string[]> {
    const suggestions = await this.jobPostModel.aggregate([
      {
        $match: {
          isActive: true,
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
          ],
        },
      },
      {
        $group: {
          _id: '$title',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { _id: 1 } },
    ]);

    return suggestions.map((item) => item._id);
  }

  async findExpiredJobs(): Promise<JobPost[]> {
    const now = new Date();
    return this.jobPostModel
      .find({
        isActive: true,
        expiresAt: { $lt: now },
      })
      .exec();
  }

  async deactivateExpiredJobs(): Promise<number> {
    const now = new Date();
    const result = await this.jobPostModel.updateMany(
      {
        isActive: true,
        expiresAt: { $lt: now },
      },
      { isActive: false },
    );

    return result.modifiedCount;
  }
}
