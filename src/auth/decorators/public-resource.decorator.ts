import { IS_PUBLIC_KEY } from '../constants/auth.constants';
import { SetMetadata } from '@nestjs/common';

export const PublicResource = () => SetMetadata(IS_PUBLIC_KEY, true);
