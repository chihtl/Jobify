import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PaginatedResponse,
  PaginationDto,
} from '../../common/dto/pagination.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category, CategoryDocument } from './schemas/category.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) { }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    try {
      const newCategory = new this.categoryModel(createCategoryDto);
      return await newCategory.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Category name already exists');
      }
      throw new BadRequestException('Failed to create category');
    }
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<Category>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [categories, totalItems] = await Promise.all([
      this.categoryModel.find().skip(skip).limit(limit).exec(),
      this.categoryModel.countDocuments().exec(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: categories,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findAllSimple(): Promise<Category[]> {
    return this.categoryModel.find().exec();
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id).exec();

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    try {
      const category = await this.categoryModel
        .findByIdAndUpdate(id, updateCategoryDto, { new: true })
        .exec();

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      return category;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Category name already exists');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.categoryModel.deleteOne({ _id: id }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('Category not found');
    }
  }

  async searchByName(
    query: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<Category>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const searchRegex = new RegExp(query, 'i');
    const filter = {
      $or: [{ name: searchRegex }, { description: searchRegex }],
    };

    const [categories, totalItems] = await Promise.all([
      this.categoryModel.find(filter).skip(skip).limit(limit).exec(),
      this.categoryModel.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: categories,
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
