import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional, MinLength, MaxLength } from 'class-validator';

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
}
