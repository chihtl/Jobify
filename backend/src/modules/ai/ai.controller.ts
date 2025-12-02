import { Body, Controller, Post, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { Public } from '../../common/decorators/auth.decorator';
import { AiService } from './ai.service';
import { OptimizeCvDto } from './dto/optimize-cv.dto';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('optimize-cv')
  @Public()
  @ApiOperation({ summary: 'Optimize CV using AI based on job requirements' })
  @ApiResponse({
    status: 200,
    description: 'CV optimization suggestions generated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            resumeText: { type: 'string', description: 'Preview of extracted resume text' },
            jobDetails: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                company: { type: 'string' },
                requirements: { type: 'array', items: { type: 'string' } },
                skills: { type: 'array', items: { type: 'string' } },
              },
            },
            analysis: {
              type: 'object',
              properties: {
                strengths: { type: 'array', items: { type: 'string' } },
                weakness: { type: 'array', items: { type: 'string' } },
                suggests: { type: 'array', items: { type: 'string' } },
              },
            },
            cached: { type: 'boolean', description: 'Whether result was from cache' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input or processing error' })
  @ApiResponse({ status: 404, description: 'Resume file or job not found' })
  async optimizeCV(@Body() optimizeCvDto: OptimizeCvDto) {
    return this.aiService.optimizeCV(optimizeCvDto);
  }

  @Post('find-candidates/:jobId')
  @Public()
  @ApiOperation({ summary: 'Find suitable candidates using AI based on job description' })
  @ApiParam({ name: 'jobId', description: 'Job Post ID' })
  @ApiResponse({
    status: 200,
    description: 'Candidates found and ranked successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            jobDetails: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                company: { type: 'string' },
                description: { type: 'string' },
              },
            },
            candidates: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  userId: { type: 'string' },
                  name: { type: 'string' },
                  email: { type: 'string' },
                  phone: { type: 'string' },
                  location: { type: 'string' },
                  bio: { type: 'string' },
                  avatarUrl: { type: 'string' },
                  resumeUrl: { type: 'string' },
                  score: { type: 'number', description: 'Similarity score (0-1)' },
                },
              },
            },
            cached: { type: 'boolean', description: 'Whether result was from cache' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid job ID or processing error' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async findCandidates(@Param('jobId') jobId: string) {
    return this.aiService.findCandidatesByAI(jobId);
  }
}
