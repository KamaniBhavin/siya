import { PrismaClient } from '@prisma/client/edge';

export function db(url: string) {
  return new PrismaClient({
    datasources: {
      db: {
        url,
      },
    },
  });
}
