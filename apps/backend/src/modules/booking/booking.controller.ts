import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiOperation({ summary: '예약 생성' })
  @ApiResponse({ status: 201, description: '예약 생성 성공' })
  @ApiResponse({ status: 409, description: '시간 충돌로 인한 예약 실패' })
  async create(
    @Body() dto: CreateBookingDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.bookingService.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: '예약 목록 조회' })
  @ApiQuery({ name: 'roomId', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'startDate', required: false, description: 'ISO 8601 형식' })
  @ApiQuery({ name: 'endDate', required: false, description: 'ISO 8601 형식' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('roomId') roomId?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.bookingService.findAll({
      roomId,
      userId,
      startDate,
      endDate,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('my')
  @ApiOperation({ summary: '내 예약 목록 조회' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findMyBookings(
    @CurrentUser('sub') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.bookingService.findAll({
      userId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('room/:roomId')
  @ApiOperation({ summary: '특정 회의실의 특정 날짜 예약 조회' })
  @ApiQuery({ name: 'date', required: true, description: 'YYYY-MM-DD 형식' })
  async findByRoom(
    @Param('roomId') roomId: string,
    @Query('date') date: string,
  ) {
    return this.bookingService.findByRoom(roomId, date);
  }

  @Get(':id')
  @ApiOperation({ summary: '예약 상세 조회' })
  async findById(@Param('id') id: string) {
    return this.bookingService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '예약 수정' })
  @ApiResponse({ status: 200, description: '예약 수정 성공' })
  @ApiResponse({ status: 409, description: '시간 충돌로 인한 수정 실패' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBookingDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.bookingService.update(id, dto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: '예약 취소' })
  async cancel(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.bookingService.cancel(id, userId);
  }
}
