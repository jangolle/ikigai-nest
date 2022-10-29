import { BadRequestException, PipeTransform } from '@nestjs/common';
import * as Joi from 'joi';
import { RegistrationDto } from './dto/registration.dto';

// TODO: move schema to provider with config to eliminate magic numbers
const RegistrationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(64),
}).options({ abortEarly: false });

export class RegistrationValidationPipe
  implements PipeTransform<RegistrationDto>
{
  transform(value: RegistrationDto): RegistrationDto {
    const result = RegistrationSchema.validate(value);

    if (result.error) {
      throw new BadRequestException(result.error.details.map((d) => d.message));
    }

    return value;
  }
}
