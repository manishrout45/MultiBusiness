import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from '../../../common/enums/role.enum';

/** Public self-registration is limited to CUSTOMER and VENDOR. */
export enum RegisterRole {
  CUSTOMER = Role.CUSTOMER,
  VENDOR = Role.VENDOR,
}

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name!: string;

  @IsEmail()
  @MaxLength(191)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'password must contain at least one letter and one number',
  })
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsEnum(RegisterRole, {
    message: 'role must be CUSTOMER or VENDOR',
  })
  role!: RegisterRole;
}
