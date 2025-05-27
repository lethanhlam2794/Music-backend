import { Observable, tap } from 'rxjs';

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';


@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  private logger = new Logger(this.constructor.name, { timestamp: true });

  public intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
const { method, url } = request;



return next.handle().pipe(
  tap((responseBody) => {
    // Chỉ log với response không phải là stream hoặc nhị phân
    if (typeof responseBody !== 'object' || responseBody.pipe) {
      this.logger.debug(`[${method}] ${url} Response: Stream initiated`);
    } else {
      this.logger.debug(
        `[${method}] ${url} Response: ${JSON.stringify(
          responseBody,

        )}`,
      );
    }
  }),
);

  }
}
