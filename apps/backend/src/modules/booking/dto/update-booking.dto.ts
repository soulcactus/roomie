import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsDateString,
  IsOptional,
  MinLength,
  MaxLength,
  IsArray,
  ArrayUnique,
} from 'class-validator';

export class UpdateBookingDto {
  @ApiPropertyOptional({ example: '변경된 미팅 제목' })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    example: '2024-12-15T14:00:00.000Z',
    description: 'ISO 8601 형식 시작 시간',
  })
  @IsDateString()
  @IsOptional()
  startAt?: string;

  @ApiPropertyOptional({
    example: '2024-12-15T15:00:00.000Z',
    description: 'ISO 8601 형식 종료 시간',
  })
  @IsDateString()
  @IsOptional()
  endAt?: string;

  @ApiPropertyOptional({
    description: '참석자 사용자 ID 목록',
    type: [String],
    example: ['clxxxxxxxxxxxxxxxxx', 'clyyyyyyyyyyyyyyyyy'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayUnique()
  participantIds?: string[];

  @ApiPropertyOptional({
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
