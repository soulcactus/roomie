import { PartialType } from '@nestjs/swagger';
import { CreateRoomDto } from './create-room.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateRoomDto extends PartialType(CreateRoomDto) {
  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
