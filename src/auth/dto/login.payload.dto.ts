import { IsEmail, IsNotEmpty } from 'class-validator';

/**
 * DTO (Data Transfer Object) representing the payload for user login.
 */
export class LoginPayloadDto {
  @IsNotEmpty({ message: 'Email cannot be empty' })
  @IsEmail({}, { message: 'Invalid email format' })
  readonly email: string;

  @IsNotEmpty({ message: 'Password cannot be empty' })
  password: string;
}
