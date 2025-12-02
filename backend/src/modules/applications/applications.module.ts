import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { Application, ApplicationSchema } from './schemas/application.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { UserActiveGuard } from 'src/common/guards/user-active.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Application.name, schema: ApplicationSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [ApplicationsController],
  providers: [ApplicationsService, UserActiveGuard],
  exports: [ApplicationsService],
})
export class ApplicationsModule { }
