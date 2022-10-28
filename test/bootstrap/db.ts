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

// acitivities with db for all test globally
// beforeEach(resetDb)
