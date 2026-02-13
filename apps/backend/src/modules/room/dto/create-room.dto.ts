import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsOptional,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ example: '대회의실 A' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ example: '본관 3층' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  location?: string;

  @ApiProperty({ example: 10, minimum: 1, maximum: 100 })
  @IsInt()
  @Min(1)
  @Max(100)
  capacity!: number;
}
