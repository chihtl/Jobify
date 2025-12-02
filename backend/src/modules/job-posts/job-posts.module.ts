import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JobPostsController } from './job-posts.controller';
import { JobPostsService } from './job-posts.service';
import { JobPost, JobPostSchema } from './schemas/job-post.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: JobPost.name, schema: JobPostSchema }]),
  ],
  controllers: [JobPostsController],
  providers: [JobPostsService],
  exports: [JobPostsService],
})
export class JobPostsModule { }
