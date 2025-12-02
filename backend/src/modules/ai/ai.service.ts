import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';
import { JobPost, JobPostDocument } from '../job-posts/schemas/job-post.schema';
import { OptimizeCvDto } from './dto/optimize-cv.dto';
import {
  OptimizedCV,
  OptimizedCVDocument,
} from './schemas/optimized-cv.schema';
import {
  FilteredUsersByAI,
  FilteredUsersByAIDocument,
} from './schemas/filtered-users-by-ai.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(
    @InjectModel(JobPost.name) private jobPostModel: Model<JobPostDocument>,
    @InjectModel(OptimizedCV.name)
    private optimizedCVModel: Model<OptimizedCVDocument>,
    @InjectModel(FilteredUsersByAI.name)
    private filteredUsersByAIModel: Model<FilteredUsersByAIDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async optimizeCV(optimizeCvDto: OptimizeCvDto): Promise<{
    success: boolean;
    data: {
      resumeText: string;
      jobDetails: {
        title: string;
        company: string;
        requirements: string[];
        skills: string[];
      };
      analysis: {
        strengths: string[];
        weakness: string[];
        suggests: string[];
      };
      cached: boolean;
      fallback?: boolean;
    };
  }> {
    const { resumeUrl, jobId, userId } = optimizeCvDto;

    try {
      // 1. Upload PDF to OpenAI and get file ID
      const fileId = await this.uploadFileToOpenAI(resumeUrl);

      // 2. Get job details with skills
      const jobDetails = await this.getJobDetails(jobId);

      // 3. Generate AI analysis using file ID
      const analysis = await this.generateCVAnalysis(fileId, jobDetails);

      return {
        success: true,
        data: {
          resumeText: 'CV đã được phân tích bởi OpenAI',
          jobDetails: {
            title: jobDetails.title,
            company: jobDetails.company?.name || 'N/A',
            requirements: jobDetails.requirements || [],
            skills: jobDetails.skills?.map((skill: any) => skill.name) || [],
          },
          analysis,
          cached: false,
          fallback: analysis.suggests.some((s) => s.includes('AI khả dụng')), // Detect fallback response
        },
      };
    } catch (error: any) {
      throw new BadRequestException(`Failed to optimize CV: ${error.message}`);
    }
  }

  private async uploadFileToOpenAI(resumeUrl: string): Promise<string> {
    try {
      // Construct full file path
      const filePath = path.join(
        process.cwd(),
        'assets',
        resumeUrl.replace(/^\//, ''),
      );

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new NotFoundException('Resume file not found');
      }

      // Upload file to OpenAI for assistants (supports PDF)
      const file = await this.openai.files.create({
        file: fs.createReadStream(filePath),
        purpose: 'assistants',
      });

      return file.id;
    } catch (error: any) {
      throw new BadRequestException(
        `Failed to upload file to OpenAI: ${error.message}`,
      );
    }
  }

  private async getJobDetails(jobId: string): Promise<any> {
    try {
      const job = await this.jobPostModel
        .findById(jobId)
        .populate('companyId', 'name')
        .populate('skillIds', 'name')
        .populate('categoryId', 'name')
        .exec();

      if (!job) {
        throw new NotFoundException('Job not found');
      }

      return {
        title: job.title,
        description: job.description,
        requirements: job.requirements || [],
        benefits: job.benefits || [],
        company: job.companyId,
        skills: job.skillIds,
        category: job.categoryId,
        experienceLevel: job.experienceLevel,
        jobType: job.jobType,
      };
    } catch (error: any) {
      throw new BadRequestException(
        `Failed to get job details: ${error.message}`,
      );
    }
  }

  private async generateCVAnalysis(
    fileId: string,
    jobDetails: any,
  ): Promise<{
    strengths: string[];
    weakness: string[];
    suggests: string[];
  }> {
    try {
      // Create assistant with file_search tool for PDF
      const assistant = await this.openai.beta.assistants.create({
        name: 'CV Analyzer',
        instructions:
          'Bạn là trợ lý HR chuyên phân tích CV. Phân tích CV và so sánh với Job Description, trả về kết quả dưới dạng JSON chính xác.',
        model: 'gpt-4o-mini',
        tools: [{ type: 'file_search' }],
      });

      // Create thread with the file
      const thread = await this.openai.beta.threads.create({
        messages: [
          {
            role: 'user',
            content: this.buildOptimizationPromptForFile(jobDetails),
            attachments: [
              {
                file_id: fileId,
                tools: [{ type: 'file_search' }],
              },
            ],
          },
        ],
      });

      // Run the assistant
      const run = await this.openai.beta.threads.runs.createAndPoll(thread.id, {
        assistant_id: assistant.id,
      });

      if (run.status !== 'completed') {
        throw new Error(`Assistant run failed with status: ${run.status}`);
      }

      // Get the messages
      const messages = await this.openai.beta.threads.messages.list(thread.id);
      const assistantMessage = messages.data.find(
        (msg) => msg.role === 'assistant',
      );

      if (!assistantMessage?.content[0]) {
        throw new Error('No response from assistant');
      }

      const analysisResult =
        assistantMessage.content[0].type === 'text'
          ? assistantMessage.content[0].text.value
          : '';

      // Clean up assistant
      try {
        await this.openai.beta.assistants.delete(assistant.id);
      } catch (error) {
        console.error('Failed to delete assistant:', error);
      }

      // Parse the AI response into structured format
      return this.parseAnalysisResult(analysisResult);
    } catch (error: any) {
      throw new BadRequestException(
        `Failed to generate AI suggestions: ${error.message}`,
      );
    }
  }

  private buildOptimizationPromptForFile(jobDetails: any): string {
    const jobInfo = `Vị trí: ${jobDetails.title} tại ${jobDetails.company?.name || 'N/A'}
Cấp độ: ${jobDetails.experienceLevel}
Loại hình: ${jobDetails.jobType}

Kỹ năng yêu cầu:
${jobDetails.skills?.map((s: any) => `- ${s.name}`).join('\n') || 'N/A'}

Yêu cầu công việc:
${jobDetails.requirements?.map((req: string) => `- ${req}`).join('\n') || 'N/A'}

Mô tả công việc:
${jobDetails.description || 'N/A'}`;

    return `Hãy phân tích CV đính kèm và so sánh với Job Description dưới đây. Trả về kết quả CHÍNH XÁC theo định dạng JSON:

{
  "strengths": ["điểm mạnh của CV phù hợp với JD", "..."],
  "weakness": ["điểm yếu hoặc thiếu sót của CV so với JD", "..."],
  "suggests": ["đề xuất cải thiện CV", "..."]
}

Job Description:
${jobInfo}

Chỉ trả về JSON, không thêm text nào khác.`;
  }


  private parseAnalysisResult(analysisResult: string): {
    strengths: string[];
    weakness: string[];
    suggests: string[];
  } {
    try {
      // Remove markdown code blocks and extract JSON
      let jsonString = analysisResult.trim();
      
      // Remove ```json and ``` markers
      jsonString = jsonString.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
      
      // Find JSON object boundaries
      const startIdx = jsonString.indexOf('{');
      const endIdx = jsonString.lastIndexOf('}');
      
      if (startIdx !== -1 && endIdx !== -1) {
        jsonString = jsonString.substring(startIdx, endIdx + 1);
      }
      
      const parsed = JSON.parse(jsonString);
      return {
        strengths: parsed.strengths || [],
        weakness: parsed.weakness || [],
        suggests: parsed.suggests || [],
      };
    } catch (error) {
      console.error('Failed to parse analysis result:', error);
      console.error('Raw result:', analysisResult);
      
      // If JSON parsing fails, return as plain text with basic structure
      return {
        strengths: [],
        weakness: [],
        suggests: [analysisResult.substring(0, 500)],
      };
    }
  }


  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async findCandidatesByAI(jobId: string): Promise<{
    success: boolean;
    data: {
      jobDetails: {
        title: string;
        company: string;
        description: string;
      };
      candidates: Array<{
        userId: string;
        name: string;
        email: string;
        phone?: string;
        location?: string;
        bio?: string;
        avatarUrl?: string;
        resumeUrl?: string;
        score: number;
      }>;
      cached: boolean;
    };
  }> {
    try {
      // 1. Check if we have cached results
      const cachedResult = await this.filteredUsersByAIModel
        .findOne({ jobId })
        .exec();

      if (cachedResult) {
        const jobDetails = await this.getJobDetails(jobId);
        return {
          success: true,
          data: {
            jobDetails: {
              title: jobDetails.title,
              company: jobDetails.company?.name || 'N/A',
              description: jobDetails.description,
            },
            candidates: cachedResult.rankedUsers.map((user) => ({
              userId: user.userId.toString(),
              name: user.name,
              email: user.email,
              phone: user.phone,
              location: user.location,
              bio: user.bio,
              avatarUrl: user.avatarUrl,
              resumeUrl: user.resumeUrl,
              score: user.score,
            })),
            cached: true,
          },
        };
      }

      // 2. Get job details
      const jobDetails = await this.getJobDetails(jobId);
      const jobDescription = jobDetails.description;

      // 3. Generate embedding from job description
      const jdEmbedding = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: jobDescription,
      });

      // 4. Get all users with embeddings
      const users = await this.userModel
        .find({ embedding: { $exists: true, $ne: null } })
        .select('name email phone location bio avatarUrl resumeUrl embedding')
        .exec();

      if (users.length === 0) {
        return {
          success: true,
          data: {
            jobDetails: {
              title: jobDetails.title,
              company: jobDetails.company?.name || 'N/A',
              description: jobDetails.description,
            },
            candidates: [],
            cached: false,
          },
        };
      }

      // 5. Calculate similarity scores and rank users
      const ranked = users
        .filter((user) => user.embedding && user.embedding.length > 0)
        .map((user) => ({
          userId: (user._id as any).toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          location: user.location,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
          resumeUrl: user.resumeUrl,
          score: this.cosineSimilarity(
            user.embedding!,
            jdEmbedding.data[0].embedding,
          ),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10); // Top 10 candidates

      // 6. Cache the results
      await this.filteredUsersByAIModel.findOneAndUpdate(
        { jobId },
        {
          jobId,
          jobDescription,
          jobEmbedding: jdEmbedding.data[0].embedding,
          rankedUsers: ranked,
          analyzedAt: new Date(),
          jobSnapshot: {
            title: jobDetails.title,
            company: jobDetails.company?.name || 'N/A',
            requirements: jobDetails.requirements || [],
            skills: jobDetails.skills?.map((s: any) => s.name) || [],
          },
        },
        { upsert: true, new: true },
      );

      return {
        success: true,
        data: {
          jobDetails: {
            title: jobDetails.title,
            company: jobDetails.company?.name || 'N/A',
            description: jobDetails.description,
          },
          candidates: ranked.map((user) => ({
            userId: user.userId,
            name: user.name,
            email: user.email,
            phone: user.phone,
            location: user.location,
            bio: user.bio,
            avatarUrl: user.avatarUrl,
            resumeUrl: user.resumeUrl,
            score: user.score,
          })),
          cached: false,
        },
      };
    } catch (error: any) {
      throw new BadRequestException(
        `Failed to find candidates: ${error.message}`,
      );
    }
  }
}
