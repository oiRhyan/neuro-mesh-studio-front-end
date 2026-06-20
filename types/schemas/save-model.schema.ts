import { z } from 'zod';

export const saveModelSchema = z.object({
    userId: z.string(),
    title: z.string().min(3, 'O titulo não pode ser nulo'),
    thumbnail: z.string().optional().or(z.any()),
    description: z.string().min(10, 'A descrição deve possuir no minimo 10 caracteres'),
    public: z.boolean(),
    model: z.string()
})

export type SaveModelSchema = z.infer<typeof saveModelSchema>