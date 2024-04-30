import { HttpStatus } from '@nestjs/common';

/**
 * Represents a custom HTTP response in the RestaurantsAPI application.
 * Should be used whenever returning a response object to the frontend.
 *
 * @template T The type of data payload included in the response.
 */
export class HttpResponse<T> {
  constructor(
    public readonly status: HttpStatus,
    public readonly statusCode: number,
    public readonly message: string,
    public readonly data?: T,
    public readonly _devMessage?: string,
    public readonly error?: any,
  ) {}
}
