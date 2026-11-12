import { execSync } from 'node:child_process';
import { rmSync } from 'node:fs';

const TEST_DB_FILE = 'test.db';

const removeTestDb = () =>
  ['', '-journal', '-wal', '-shm'].forEach((suffix) =>
    rmSync(`${TEST_DB_FILE}${suffix}`, { force: true }),
  );

/** Builds a fresh SQLite database from the real migrations for the e2e run. */
export function setup() {
  removeTestDb();
  execSync('npx prisma migrate deploy', {
    stdio: 'ignore',
    env: { ...process.env, DATABASE_URL: `file:./${TEST_DB_FILE}` },
  });
}

export function teardown() {
  removeTestDb();
}
