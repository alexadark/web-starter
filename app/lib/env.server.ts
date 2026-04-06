import { z } from "zod/v4";

const serverEnvSchema = z.object({
	DATABASE_URL: z.string().url(),
});

const parsed = serverEnvSchema.safeParse(process.env);

if (!parsed.success) {
	console.error(
		"Invalid environment variables:",
		parsed.error.flatten().fieldErrors,
	);
	throw new Error("Missing or invalid environment variables. Check .env file.");
}

export const env = parsed.data;
