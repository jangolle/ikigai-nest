import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class BullService {
  private readonly queuePool: Set<Queue> = new Set<Queue>();
  private isFreezed: boolean = false;

  freez(): void {
    this.isFreezed = true;
  }

  addQueue(queue: Queue) {
    if (this.isFreezed) {
      throw new Error('Instance is freezed, no mutations allowed');
    }
    this.queuePool.add(queue);
  }

  getQueues(): Set<Queue> {
    return this.queuePool;
  }
}
