import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaginatedResponse, PaginationDto } from '../../common/dto/pagination.dto';
import { CreateSavedJobDto } from './dto/create-saved-job.dto';
import { SavedJob, SavedJobDocument } from './schemas/saved-job.schema';

@Injectable()
export class SavedJobsService {
  constructor(
    @InjectModel(SavedJob.name) private savedJobModel: Model<SavedJobDocument>,
  ) { }

  async saveJob(createSavedJobDto: CreateSavedJobDto): Promise<SavedJob> {
    try {
      const newSavedJob = new this.savedJobModel(createSavedJobDto);
      const savedJob = await newSavedJob.save();
      return this.findOne((savedJob._id as any).toString());
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Job is already saved by this user');
      }
      throw new BadRequestException('Failed to save job');
    }
  }

  async findByUser(userId: string, paginationDto: PaginationDto): Promise<PaginatedResponse<SavedJob>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [savedJobs, totalItems] = await Promise.all([
      this.savedJobModel
        .find({ userId })
        .populate({
          path: 'jobPostId',
          populate: [
            { path: 'companyId', select: 'name logoUrl location' },
            { path: 'categoryId', select: 'name' },
            { path: 'skillIds', select: 'name' },
          ],
        })
        .sort({ savedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.savedJobModel.countDocuments({ userId }).exec(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: savedJobs,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<SavedJob> {
    const savedJob = await this.savedJobModel
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

    if (!savedJob) {
      throw new NotFoundException('Saved job not found');
    }

    return savedJob;
  }

  async unsaveJob(userId: string, jobPostId: string): Promise<void> {
    const result = await this.savedJobModel
      .deleteOne({ userId, jobPostId })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('Saved job not found');
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.savedJobModel.deleteOne({ _id: id }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('Saved job not found');
    }
  }

  async checkIfJobSaved(userId: string, jobPostId: string): Promise<boolean> {
    const savedJob = await this.savedJobModel
      .findOne({ userId, jobPostId })
      .exec();

    return !!savedJob;
  }

  async toggleSaveJob(userId: string, jobPostId: string): Promise<{ saved: boolean; message: string }> {
    const existingSavedJob = await this.savedJobModel
      .findOne({ userId, jobPostId })
      .exec();

    if (existingSavedJob) {
      // Unsave the job
      await this.savedJobModel.deleteOne({ _id: existingSavedJob._id }).exec();
      return {
        saved: false,
        message: 'Job unsaved successfully',
      };
    } else {
      // Save the job
      const newSavedJob = new this.savedJobModel({ userId, jobPostId });
      await newSavedJob.save();
      return {
        saved: true,
        message: 'Job saved successfully',
      };
    }
  }

  async getSavedJobIds(userId: string): Promise<string[]> {
    const savedJobs = await this.savedJobModel
      .find({ userId })
      .select('jobPostId')
      .exec();

    return savedJobs.map((savedJob) => savedJob.jobPostId.toString());
  }

  async getStatsByUser(userId: string): Promise<any> {
    const totalSaved = await this.savedJobModel.countDocuments({ userId }).exec();

    const categoryStats = await this.savedJobModel.aggregate([
      { $match: { userId } },
      {
        $lookup: {
          from: 'job_posts',
          localField: 'jobPostId',
          foreignField: '_id',
          as: 'jobPost',
        },
      },
      { $unwind: '$jobPost' },
      {
        $lookup: {
          from: 'categories',
          localField: 'jobPost.categoryId',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $group: {
          _id: '$category.name',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return {
      totalSaved,
      categoryBreakdown: categoryStats,
    };
  }
}