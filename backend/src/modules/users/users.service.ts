import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import { Model } from 'mongoose';
import OpenAI from 'openai';
import {
  PaginatedResponse,
  PaginationDto,
} from '../../common/dto/pagination.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { PDFParse } from 'pdf-parse';

@Injectable()
export class UsersService {
  private openai: OpenAI;

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      const newUser = new this.userModel({
        ...createUserDto,
        passwordHash: hashedPassword,
      });

      return await newUser.save();
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictException('Email already exists');
      }
      throw new BadRequestException('Failed to create user');
    }
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<User>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [users, totalItems] = await Promise.all([
      this.userModel
        .find()
        .select('-passwordHash')
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments().exec(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: users,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel
      .findById(id)
      .select('-passwordHash')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const user = await this.userModel
        .findByIdAndUpdate(id, updateUserDto, { new: true })
        .select('-passwordHash')
        .exec();

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.deleteOne({ _id: id }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('User not found');
    }
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await this.userModel
      .updateOne({ _id: id }, { passwordHash: hashedPassword })
      .exec();

    if (result.matchedCount === 0) {
      throw new NotFoundException('User not found');
    }
  }

  async generateEmbeddingFromText(text: string): Promise<number[]> {
    try {
      const embedding = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });

      return embedding.data[0].embedding;
    } catch (error: any) {
      throw new BadRequestException(
        `Failed to generate embedding: ${error.message}`,
      );
    }
  }

  async extractTextFromPDF(filePath: string): Promise<string> {
    try {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new NotFoundException('PDF file not found');
      }

      // Read and parse PDF
      const dataBuffer = fs.readFileSync(filePath);
      const parser = new PDFParse({ data: dataBuffer });
      const pdfData = await parser.getText();

      return pdfData.text;
    } catch (error: any) {
      throw new BadRequestException(
        `Failed to extract text from PDF: ${error.message}`,
      );
    }
  }

  async updateUserEmbedding(userId: string, resumePath: string): Promise<void> {
    try {
      // Extract text from PDF
      const resumeText = await this.extractTextFromPDF(resumePath);

      // Generate embedding from text
      const embedding = await this.generateEmbeddingFromText(resumeText);

      // Update user with embedding
      await this.userModel.findByIdAndUpdate(userId, { embedding }).exec();
    } catch (error: any) {
      // Log error but don't fail the main request
      console.error('Failed to update user embedding:', error.message);
    }
  }

  // Calculate cosine similarity between two vectors
  private calculateCosineSimilarity(
    vectorA: number[],
    vectorB: number[],
  ): number {
    if (vectorA.length !== vectorB.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      normA += vectorA[i] * vectorA[i];
      normB += vectorB[i] * vectorB[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Perform vector similarity search manually with optimization
  private async performVectorSearch(
    queryEmbedding: number[],
    filterConditions: Record<string, any>,
    skip: number,
    limit: number,
  ): Promise<{ users: User[]; totalItems: number }> {
    // First, get all users that match the filter conditions and have embeddings
    // Limit the initial query to improve performance
    const maxCandidates = 1000; // Limit to prevent memory issues

    const allUsers = await this.userModel
      .find({
        ...filterConditions,
        embedding: { $exists: true, $ne: null, $not: { $size: 0 } },
      })
      .select('-passwordHash')
      .limit(maxCandidates)
      .exec();

    if (allUsers.length === 0) {
      return { users: [], totalItems: 0 };
    }

    // Calculate similarity scores for each user in batches to prevent blocking
    const batchSize = 100;
    const usersWithScores: Array<any> = [];

    for (let i = 0; i < allUsers.length; i += batchSize) {
      const batch = allUsers.slice(i, i + batchSize);

      const batchResults = batch
        .map((user) => {
          const similarity = this.calculateCosineSimilarity(
            queryEmbedding,
            user.embedding || [],
          );
          return {
            ...user.toObject(),
            score: similarity,
          };
        })
        .filter((user) => user.score > 0.1); // Filter out very low similarity scores

      usersWithScores.push(...batchResults);

      // Allow event loop to process other tasks
      if (i + batchSize < allUsers.length) {
        await new Promise((resolve) => setImmediate(resolve));
      }
    }

    // Sort by similarity score descending
    usersWithScores.sort((a, b) => b.score - a.score);

    const totalItems = usersWithScores.length;
    const paginatedUsers = usersWithScores.slice(skip, skip + limit);

    return {
      users: paginatedUsers as User[],
      totalItems,
    };
  }

  // Admin management methods
  async getAllUsers(): Promise<User[]> {
    return this.userModel
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

  async searchCandidates(searchParams: {
    query?: string;
    skillIds?: string[];
    experienceTitle?: string;
    experienceCompany?: string;
    location?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<User>> {
    const {
      query,
      skillIds,
      experienceTitle,
      experienceCompany,
      location,
      page = 1,
      limit = 10,
    } = searchParams;

    const skip = (page - 1) * limit;

    // Build filter conditions
    const filterConditions: Record<string, any> = {};

    // Location filter
    if (location) {
      filterConditions.location = { $regex: location, $options: 'i' };
    }

    // Skills filter (OR condition)
    if (skillIds && skillIds.length > 0) {
      filterConditions.skillIds = { $in: skillIds };
    }

    // Experience filters (OR condition)
    const experienceConditions: Record<string, any>[] = [];
    if (experienceTitle) {
      experienceConditions.push({
        'experiences.title': { $regex: experienceTitle, $options: 'i' },
      });
    }
    if (experienceCompany) {
      experienceConditions.push({
        'experiences.company': { $regex: experienceCompany, $options: 'i' },
      });
    }

    if (experienceConditions.length > 0) {
      filterConditions.$or = experienceConditions;
    }

    let users: User[];
    let totalItems: number;

    if (query && query.trim()) {
      // Vector similarity search using manual cosine similarity
      try {
        const queryEmbedding = await this.generateEmbeddingFromText(query);

        // Use manual vector search
        const vectorSearchResult = await this.performVectorSearch(
          queryEmbedding,
          filterConditions,
          skip,
          limit,
        );

        users = vectorSearchResult.users;
        totalItems = vectorSearchResult.totalItems;
      } catch (error) {
        console.error(
          'Vector search failed, falling back to text search:',
          error,
        );

        // Fallback to text search
        if (query) {
          const existingOr = filterConditions.$or || [];
          filterConditions.$or = [
            ...existingOr,
            { name: { $regex: query, $options: 'i' } },
            { bio: { $regex: query, $options: 'i' } },
          ];
        }

        [users, totalItems] = await Promise.all([
          this.userModel
            .find(filterConditions)
            .select('-passwordHash')
            .skip(skip)
            .limit(limit)
            .exec(),
          this.userModel.countDocuments(filterConditions).exec(),
        ]);
      }
    } else {
      // Regular filtered search without vector similarity
      [users, totalItems] = await Promise.all([
        this.userModel
          .find(filterConditions)
          .select('-passwordHash')
          .skip(skip)
          .limit(limit)
          .exec(),
        this.userModel.countDocuments(filterConditions).exec(),
      ]);
    }

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: users,
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
