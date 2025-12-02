import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JobPost, JobPostSchema } from '../job-posts/schemas/job-post.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { OptimizedCV, OptimizedCVSchema } from './schemas/optimized-cv.schema';
import { FilteredUsersByAI, FilteredUsersByAISchema } from './schemas/filtered-users-by-ai.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: JobPost.name, schema: JobPostSchema },
      { name: OptimizedCV.name, schema: OptimizedCVSchema },
      { name: FilteredUsersByAI.name, schema: FilteredUsersByAISchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
