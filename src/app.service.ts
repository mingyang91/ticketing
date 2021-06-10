import { Injectable } from '@nestjs/common';

@Injectable()
class AppService {
  async getHello(): Promise<string> {
    return 'Hello World!';
  }
}

export { AppService };
