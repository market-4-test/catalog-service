import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class BigintSerializerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: unknown) => {
        return JSON.parse(
          JSON.stringify(data, (key, value) =>
            typeof value === 'bigint' ? Number(value) : value,
          ),
        );
      }),
    );
  }
}
