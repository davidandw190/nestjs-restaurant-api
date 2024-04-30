import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

/**
 * Represents a user in the system.
 */
@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @Prop({ required: true })
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  @Prop({ unique: true, required: true })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @Prop({ required: true, select: false })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
