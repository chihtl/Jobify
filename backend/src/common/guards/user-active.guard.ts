import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../modules/users/schemas/user.schema';

@Injectable()
export class UserActiveGuard implements CanActivate {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    // Chỉ check cho các method khác GET
    if (method === 'GET') {
      return true;
    }

    // Lấy user ID từ params hoặc user trong request
    const userId = request.params?.id || request.user?.id;
    
    if (!userId) {
      // Nếu không có userId thì cho phép (có thể là tạo user mới)
      return true;
    }

    try {
      // Tìm user trong database
      const user = await this.userModel.findById(userId).exec();
      
      if (!user) {
        // Nếu user không tồn tại thì cho phép (sẽ được handle ở service)
        return true;
      }

      // Kiểm tra isActive, chỉ chặn nếu isActive = false (không check null/undefined)
      if (user.isActive === false) {
        throw new ForbiddenException('User account is deactivated');
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      // Nếu có lỗi khác thì cho phép (để tránh block không cần thiết)
      return true;
    }
  }
}
