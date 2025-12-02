import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { BookingResponseDto } from './dto/booking-response.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/auth.decorator';

@ApiTags('Bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({
    status: 201,
    description: 'Booking created successfully',
    type: BookingResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error or existing booking',
  })
  async create(
    @Body() createBookingDto: CreateBookingDto & { companyId: string },
  ) {
    const { companyId, ...bookingData } = createBookingDto;
    return this.bookingsService.create(companyId, bookingData);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all bookings with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Bookings retrieved successfully',
  })
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.bookingsService.findAll(paginationDto);
  }

  @Get('company/:companyId')
  @Public()
  @ApiOperation({ summary: 'Get bookings by company ID' })
  @ApiParam({ name: 'companyId', description: 'Company ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Company bookings retrieved successfully',
  })
  async findByCompany(
    @Param('companyId') companyId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return await this.bookingsService.findByCompany(companyId, paginationDto);
  }

  @Get('candidate/:candidateId')
  @Public()
  @ApiOperation({ summary: 'Get bookings by candidate ID' })
  @ApiParam({ name: 'candidateId', description: 'Candidate ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Candidate bookings retrieved successfully',
  })
  async findByCandidate(
    @Param('candidateId') candidateId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return await this.bookingsService.findByCandidate(
      candidateId,
      paginationDto,
    );
  }

  @Get('check/:companyId/:candidateId')
  @Public()
  @ApiOperation({
    summary: 'Check if booking exists between company and candidate',
  })
  @ApiParam({ name: 'companyId', description: 'Company ID' })
  @ApiParam({ name: 'candidateId', description: 'Candidate ID' })
  @ApiResponse({
    status: 200,
    description: 'Booking check completed',
  })
  async checkExistingBooking(
    @Param('companyId') companyId: string,
    @Param('candidateId') candidateId: string,
  ) {
    const existingBooking = await this.bookingsService.checkExistingBooking(
      companyId,
      candidateId,
    );
    return {
      hasExistingBooking: !!existingBooking,
      booking: existingBooking,
    };
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({
    status: 200,
    description: 'Booking retrieved successfully',
    type: BookingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Patch(':id')
  @Public()
  @ApiOperation({ summary: 'Update booking by ID' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({
    status: 200,
    description: 'Booking updated successfully',
    type: BookingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
  ) {
    return this.bookingsService.update(id, updateBookingDto);
  }

  @Delete(':id')
  @Public()
  @ApiOperation({ summary: 'Delete booking by ID' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Booking deleted successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async remove(@Param('id') id: string) {
    await this.bookingsService.remove(id);
    return { message: 'Booking deleted successfully' };
  }
}
