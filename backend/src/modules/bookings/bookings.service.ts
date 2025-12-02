import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PaginatedResponse,
  PaginationDto,
} from '../../common/dto/pagination.dto';
import {
  Booking,
  BookingDocument,
  BookingStatus,
} from './schemas/booking.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { BookingResponseDto } from './dto/booking-response.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
  ) {}

  async create(
    companyId: string,
    createBookingDto: CreateBookingDto,
  ): Promise<BookingResponseDto> {
    // Check if there's already a booking between this company and candidate
    const existingBooking = await this.bookingModel.findOne({
      companyId,
      candidateId: createBookingDto.candidateId,
      status: { $in: [BookingStatus.PENDING, BookingStatus.ACCEPTED] },
    });

    if (existingBooking) {
      throw new BadRequestException(
        'Đã có lời mời đang chờ xử lý hoặc đã được chấp nhận với ứng viên này',
      );
    }

    // Validate scheduled date is in the future
    const scheduledDate = new Date(createBookingDto.scheduledDate);
    if (scheduledDate <= new Date()) {
      throw new BadRequestException(
        'Thời gian hẹn phải là thời điểm trong tương lai',
      );
    }

    const booking = new this.bookingModel({
      ...createBookingDto,
      companyId,
      scheduledDate,
    });

    const savedBooking = await booking.save();
    const populatedBooking = await this.findOne(
      (savedBooking._id as any).toString(),
    );

    return populatedBooking;
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<BookingResponseDto>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [bookings, totalItems] = await Promise.all([
      this.bookingModel
        .find()
        .populate('companyId', 'name email logoUrl')
        .populate('candidateId', 'name email phone avatarUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.bookingModel.countDocuments(),
    ]);

    const data = bookings.map((booking) =>
      plainToClass(BookingResponseDto, booking.toObject(), {
        excludeExtraneousValues: true,
      }),
    );

    return {
      data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        hasNextPage: page < Math.ceil(totalItems / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  async findByCompany(
    companyId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<BookingResponseDto>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [bookings, totalItems] = await Promise.all([
      this.bookingModel
        .find({ companyId })
        .populate('companyId', 'name email logoUrl')
        .populate('candidateId', 'name email phone avatarUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.bookingModel.countDocuments({ companyId }),
    ]);

    const data = bookings.map((booking) =>
      plainToClass(BookingResponseDto, booking.toObject(), {
        excludeExtraneousValues: true,
      }),
    );

    return {
      data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        hasNextPage: page < Math.ceil(totalItems / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  async findByCandidate(
    candidateId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<BookingResponseDto>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [bookings, totalItems] = await Promise.all([
      this.bookingModel
        .find({ candidateId })
        .populate('companyId', 'name email logoUrl')
        .populate('candidateId', 'name email phone avatarUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.bookingModel.countDocuments({ candidateId }),
    ]);

    const data = bookings.map((booking) =>
      plainToClass(BookingResponseDto, booking.toObject(), {
        excludeExtraneousValues: true,
      }),
    );

    return {
      data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        hasNextPage: page < Math.ceil(totalItems / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<BookingResponseDto> {
    const booking = await this.bookingModel
      .findById(id)
      .populate('companyId', 'name email logoUrl')
      .populate('candidateId', 'name email phone avatarUrl')
      .exec();

    if (!booking) {
      throw new NotFoundException('Không tìm thấy lời mời');
    }

    return plainToClass(BookingResponseDto, booking.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  async update(
    id: string,
    updateBookingDto: UpdateBookingDto,
  ): Promise<BookingResponseDto> {
    const booking = await this.bookingModel.findById(id);

    if (!booking) {
      throw new NotFoundException('Không tìm thấy lời mời');
    }

    // If updating status to accepted/rejected, set respondedAt
    if (
      updateBookingDto.status &&
      [BookingStatus.ACCEPTED, BookingStatus.REJECTED].includes(
        updateBookingDto.status,
      )
    ) {
      (updateBookingDto as any).respondedAt = new Date();
    }

    // Validate scheduled date if updating
    if (updateBookingDto.scheduledDate) {
      const scheduledDate = new Date(updateBookingDto.scheduledDate);
      if (scheduledDate <= new Date()) {
        throw new BadRequestException(
          'Thời gian hẹn phải là thời điểm trong tương lai',
        );
      }
    }

    const updatedBooking = await this.bookingModel
      .findByIdAndUpdate(id, updateBookingDto, { new: true })
      .populate('companyId', 'name email logoUrl')
      .populate('candidateId', 'name email phone avatarUrl')
      .exec();

    if (!updatedBooking) {
      throw new NotFoundException('Không tìm thấy lời mời sau khi cập nhật');
    }

    return plainToClass(BookingResponseDto, updatedBooking.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  async remove(id: string): Promise<void> {
    const booking = await this.bookingModel.findById(id);

    if (!booking) {
      throw new NotFoundException('Không tìm thấy lời mời');
    }

    await this.bookingModel.findByIdAndDelete(id);
  }

  async checkExistingBooking(
    companyId: string,
    candidateId: string,
  ): Promise<BookingResponseDto | null> {
    const existingBooking = await this.bookingModel
      .findOne({
        companyId,
        candidateId,
        status: { $in: [BookingStatus.PENDING, BookingStatus.ACCEPTED] },
      })
      .populate('companyId', 'name email logoUrl')
      .populate('candidateId', 'name email phone avatarUrl')
      .exec();

    if (!existingBooking) {
      return null;
    }

    return plainToClass(BookingResponseDto, existingBooking.toObject(), {
      excludeExtraneousValues: true,
    });
  }
}
