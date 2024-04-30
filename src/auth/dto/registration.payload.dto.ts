import { IsEmail, IsNotEmpty, Matches } from 'class-validator';

/**
 * DTO (Data Transfer Object) representing the payload for user registration.
 */
export class RegistrationPayloadDTO {
  @IsNotEmpty({ message: 'First name cannot be empty' })
  readonly firstName: string;

  @IsNotEmpty({ message: 'Last Name cannot be empty' })
  readonly lastName: string;

  @IsNotEmpty({ message: 'Email cannot be empty' })
  @IsEmail({}, { message: 'Invalid email format' })
  readonly email: string;

  @IsNotEmpty({ message: 'Password cannot be empty' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, {
    message:
      'Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, and one digit',
  })
  readonly password: string;

  @IsNotEmpty({ message: 'The entered password must be confirmed' })
  readonly confirmPassword: string;
}
