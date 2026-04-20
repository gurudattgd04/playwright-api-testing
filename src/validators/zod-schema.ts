import {z} from "zod"

export const PostSchema = z.object({
    userId: z.number().int().positive(),
    id: z.number().int().positive(),
    title: z.string().min(1),
    body: z.string().min(1)
})

export type Post = z.infer<typeof PostSchema>

export function parseSchema<T>(schema: z.ZodType<T>, data: unknown): T{
    return schema.parse(data)
}

export function parseArraySchema<T>(schema: z.ZodType<T>, data: unknown): T[] {
    return z.array(schema).min(1).parse(data)
}

export function safeParseSchema<T>(
    schema: z.ZodType<T>,
    data: unknown,
): ReturnType<typeof schema.safeParse> {
    return schema.safeParse(data)
}