import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SavedJobsController } from './saved-jobs.controller';
import { SavedJobsService } from './saved-jobs.service';
import { SavedJob, SavedJobSchema } from './schemas/saved-job.schema';
import {User, UserSchema} from '../users/schemas/user.schema';
import { UserActiveGuard } from 'src/common/guards/user-active.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SavedJob.name, schema: SavedJobSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [SavedJobsController],
  providers: [SavedJobsService, UserActiveGuard],
  exports: [SavedJobsService],
})
export class SavedJobsModule { }