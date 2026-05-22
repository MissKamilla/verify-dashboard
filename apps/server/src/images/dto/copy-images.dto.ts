import { ApiExtraModels } from '@nestjs/swagger';

import { MoveImagesDto } from './move-images.dto';

@ApiExtraModels(MoveImagesDto)
export class CopyImagesDto extends MoveImagesDto {}
