import { SetMetadata } from '@nestjs/common';

export const AllowedRoles = (...roles: string[]) => SetMetadata('roles', roles);
