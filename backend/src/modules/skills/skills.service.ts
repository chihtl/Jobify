import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaginatedResponse, PaginationDto } from '../../common/dto/pagination.dto';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Skill, SkillDocument } from './schemas/skill.schema';

@Injectable()
export class SkillsService {
  constructor(
    @InjectModel(Skill.name) private skillModel: Model<SkillDocument>,
  ) { }

  async create(createSkillDto: CreateSkillDto): Promise<Skill> {
    try {
      const newSkill = new this.skillModel(createSkillDto);
      const savedSkill = await newSkill.save();
      return this.findOne((savedSkill._id as any).toString());
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Skill name already exists');
      }
      throw new BadRequestException('Failed to create skill');
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponse<Skill>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [skills, totalItems] = await Promise.all([
      this.skillModel
        .find()
        .populate('categoryId', 'name description')
        .skip(skip)
        .limit(limit)
        .exec(),
      this.skillModel.countDocuments().exec(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: skills,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findAllSimple(): Promise<Skill[]> {
    return this.skillModel.find().populate('categoryId', 'name').exec();
  }

  async findByCategory(categoryId: string): Promise<Skill[]> {
    return this.skillModel
      .find({ categoryId })
      .populate('categoryId', 'name description')
      .exec();
  }

  async findOne(id: string): Promise<Skill> {
    const skill = await this.skillModel
      .findById(id)
      .populate('categoryId', 'name description')
      .exec();

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    return skill;
  }

  async update(id: string, updateSkillDto: UpdateSkillDto): Promise<Skill> {
    try {
      const skill = await this.skillModel
        .findByIdAndUpdate(id, updateSkillDto, { new: true })
        .populate('categoryId', 'name description')
        .exec();

      if (!skill) {
        throw new NotFoundException('Skill not found');
      }

      return skill;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Skill name already exists');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.skillModel.deleteOne({ _id: id }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('Skill not found');
    }
  }

  async searchByName(query: string, paginationDto: PaginationDto): Promise<PaginatedResponse<Skill>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const searchRegex = new RegExp(query, 'i');
    const filter = { name: searchRegex };

    const [skills, totalItems] = await Promise.all([
      this.skillModel
        .find(filter)
        .populate('categoryId', 'name description')
        .skip(skip)
        .limit(limit)
        .exec(),
      this.skillModel.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: skills,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findByIds(skillIds: string[]): Promise<Skill[]> {
    return this.skillModel
      .find({ _id: { $in: skillIds } })
      .populate('categoryId', 'name')
      .exec();
  }
}