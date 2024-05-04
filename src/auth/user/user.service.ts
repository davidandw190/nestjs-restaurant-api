import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import { RegistrationPayloadDTO } from '../dto/registration.payload.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  async findById(userId: number): Promise<User> {
    const user = this.userModel
      .findOne({ id: userId })
      .select('+password')
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = this.userModel
      .findOne({ email: email })
      .select('+password')
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async create(user: RegistrationPayloadDTO): Promise<User> {
    const newUser = new this.userModel(user);
    try {
      return await newUser.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('User with this email already exists');
      }

      throw new Error('Error creating user');
    }
  }
}
