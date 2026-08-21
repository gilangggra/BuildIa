import { IsString, IsNotEmpty, IsOptional, IsIn, MaxLength } from 'class-validator';

export class CreateAgentDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;

  @IsOptional()
  @IsString()
  @IsIn(['code', 'srs', 'diagram', 'test', 'deployment'])
  type?: string;

  @IsOptional()
  @IsString()
  icon_name?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  system_prompt: string;
}
