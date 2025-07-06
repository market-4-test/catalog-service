import { BigintSerializerInterceptor } from 'src/interceptors/bigint-serializer/bigint-serializer.interceptor';

describe('BigintSerializerInterceptor', () => {
  it('should be defined', () => {
    expect(new BigintSerializerInterceptor()).toBeDefined();
  });
});
