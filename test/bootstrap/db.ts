import { execSync } from 'child_process';
import { join } from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

const prismaBinary = join(
  __dirname,
  '..',
  '..',
  'node_modules',
  '.bin',
  'prisma',
);

const { DATABASE_TEST_URL } = process.env;
process.env.DATABASE_URL = DATABASE_TEST_URL;

export const resetDb = () => {
  execSync(`${prismaBinary} migrate reset --force`, {
    env: {
      ...process.env,
      DATABASE_URL: DATABASE_TEST_URL,
    },
  });
};

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class AsyncLock {
  private readonly deferred: Promise<void>;
  private readonly intervalMs: number;

  private timeout: NodeJS.Timeout;
  private timer: NodeJS.Timer;
  private resolveFn: CallableFunction;

  constructor({
    timeoutMs = 10000,
    intervalMs = 100,
  }: { timeoutMs?: number; intervalMs?: number } = {}) {
    this.intervalMs = intervalMs;

    this.deferred = new Promise((resolve, reject) => {
      this.timeout = setTimeout(
        () => reject(new Error('AsyncLock timeout reached')),
        timeoutMs,
      );
      this.resolveFn = () => {
        clearTimeout(this.timeout);
        clearInterval(this.timer);
        resolve();
      };
    });
  }

  releaseOn(cb: CallableFunction) {
    this.timer = setInterval(
      async () => ((await cb()) ? this.release() : undefined),
      this.intervalMs,
    );
  }

  release() {
    this.resolveFn();
  }

  async hold(): Promise<void> {
    return this.deferred;
  }
}

// acitivities with db for all test globally
// beforeEach(resetDb)
