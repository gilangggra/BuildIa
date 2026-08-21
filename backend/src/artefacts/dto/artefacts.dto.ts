import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  MaxLength,
} from 'class-validator';

export class GenerateArtefactDto {
  @IsString()
  @IsNotEmpty({ message: 'prompt is required' })
  @MaxLength(5000, { message: 'prompt must not exceed 5000 characters' })
  prompt: string;

  @IsString()
  @IsIn(['srs', 'diagram', 'code', 'test', 'deployment'], {
    message: 'type must be one of: srs, diagram, code, test, deployment',
  })
  type: string;

  @IsString()
  @IsIn(['ideator', 'documenter', 'diagrammer', 'code-generator', 'qa-tester'], {
    message:
      'agentType must be one of: ideator, documenter, diagrammer, code-generator, qa-tester',
  })
  agentType: string;
}

export class RefactorArtefactDto {
  @IsString()
  @IsNotEmpty({ message: 'prompt is required' })
  @MaxLength(5000, { message: 'prompt must not exceed 5000 characters' })
  prompt: string;
}

export class MagicBuildDto {
  @IsString()
  @IsNotEmpty({ message: 'prompt is required' })
  @MaxLength(2000, { message: 'prompt must not exceed 2000 characters' })
  prompt: string;
}

export class UpdateArtefactDto {
  @IsOptional()
  @IsString()
  @IsIn(['draft', 'approved', 'final', 'rejected'], {
    message: 'status must be one of: draft, approved, final, rejected',
  })
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200000)
  content?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;
}
