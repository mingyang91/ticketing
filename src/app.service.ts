import { Injectable } from '@nestjs/common';

@Injectable()
class AppService {
  async getHello(): Promise<string> {
    return 'Hello World!';
  }

  async bookTicket(): Promise<boolean> {
    const duration = 250 + Math.random() * (3000 - 250);
    await delay(duration);
    if (Math.random() > 0.2) {
      return;
    } else {
      throw new Error('Airline: ticket book failed');
    }
  }

  async cancelTicket(): Promise<boolean> {
    const duration = 250 + Math.random() * (3000 - 250);
    await delay(duration);
    if (Math.random() > 0.2) {
      return;
    } else {
      throw new Error('Airline: ticket cancel failed');
    }
  }

  async pay() {
    const duration = 250 + Math.random() * (3000 - 250);
    await delay(duration);
    if (Math.random() > 0.1) {
      return;
    } else {
      throw new Error('Pay: failed');
    }
  }
}

function delay(duration: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

export { AppService };
