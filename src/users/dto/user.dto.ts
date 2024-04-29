import { Expose } from 'class-transformer';
import { BaseDto } from 'src/util/base_dto';

export class GetUserDto extends BaseDto {
  @Expose()
  name: string;

  @Expose()
  email: string;
}
