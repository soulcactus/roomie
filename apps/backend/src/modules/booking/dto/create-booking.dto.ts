import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, MinLength, MaxLength } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: 'clxxxxxxxxxxxxxxxxx', description: '회의실 ID' })
  @IsString()
  roomId: string;

  @ApiProperty({ example: '주간 팀 미팅' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @ApiProperty({
    example: '2024-12-15T10:00:00.000Z',
    description: 'ISO 8601 형식 시작 시간',
  })
  @IsDateString()
  startAt: string;

  @ApiProperty({
    example: '2024-12-15T11:00:00.000Z',
    description: 'ISO 8601 형식 종료 시간',
  })
  @IsDateString()
  endAt: string;
}
