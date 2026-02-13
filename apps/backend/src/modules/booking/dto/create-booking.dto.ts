import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsDateString,
  MinLength,
  MaxLength,
  IsOptional,
  IsArray,
  ArrayUnique,
} from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: 'clxxxxxxxxxxxxxxxxx', description: '회의실 ID' })
  @IsString()
  roomId!: string;

  @ApiProperty({ example: '주간 팀 미팅' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @ApiProperty({
    example: '2024-12-15T10:00:00.000Z',
    description: 'ISO 8601 형식 시작 시간',
  })
  @IsDateString()
  startAt!: string;

  @ApiProperty({
    example: '2024-12-15T11:00:00.000Z',
    description: 'ISO 8601 형식 종료 시간',
  })
  @IsDateString()
  endAt!: string;

  @ApiProperty({
    required: false,
    description: '참석자 사용자 ID 목록 (예약자 포함 권장)',
    type: [String],
    example: ['clxxxxxxxxxxxxxxxxx', 'clyyyyyyyyyyyyyyyyy'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayUnique()
  participantIds?: string[];

  @ApiProperty({
    required: false,
    description: '외부 참석자 이름 목록',
    type: [String],
    example: ['외부참석자 1', '외부참석자 2'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayUnique()
  externalParticipants?: string[];
}
