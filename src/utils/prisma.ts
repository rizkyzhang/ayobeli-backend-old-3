import { promisify } from "node:util";
import { exec as execCb } from "node:child_process";

const exec = promisify(execCb);

export async function prismaMigrate(databaseUrl: string): Promise<void> {
  const { stdout, stderr } = await exec("pnpm run prisma:migrate", {
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
    },
  });
  console.log(stdout);
  console.log(stderr);
}

// Reference: https://github.com/prisma/prisma/issues/4703#issuecomment-1447354363
