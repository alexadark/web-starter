import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { ZodSchema } from "zod";
import type * as schema from "~/lib/db/schema";
import { appConfig } from "~/lib/db/schema";

type DB = PostgresJsDatabase<typeof schema>;

/**
 * Get a typed config value by key. Returns null if not found or validation fails.
 */
export const getConfig = async <T>(
  db: DB,
  key: string,
  zodSchema: ZodSchema<T>,
): Promise<T | null> => {
  const rows = await db
    .select()
    .from(appConfig)
    .where(eq(appConfig.key, key))
    .limit(1);

  if (rows.length === 0) return null;

  const result = zodSchema.safeParse(rows[0].value);
  if (!result.success) return null;

  return result.data;
};

/**
 * Upsert a config entry by key.
 */
export const setConfig = async (
  db: DB,
  key: string,
  value: unknown,
): Promise<void> => {
  const existing = await db
    .select({ id: appConfig.id })
    .from(appConfig)
    .where(eq(appConfig.key, key))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(appConfig)
      .set({ value, updatedAt: new Date() })
      .where(eq(appConfig.key, key));
  } else {
    await db.insert(appConfig).values({ key, value });
  }
};

/**
 * Delete a config entry by key.
 */
export const deleteConfig = async (db: DB, key: string): Promise<void> => {
  await db.delete(appConfig).where(eq(appConfig.key, key));
};
