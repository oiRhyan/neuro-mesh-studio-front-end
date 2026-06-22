import z from 'zod'

export const loginSchema = z.object({
    email: z.string().min(4).min(1, { message: 'O e-mail é obrigatório' }).email({ message: 'Digite um e-mail válido' }),
    password: z.string().min(8, {message: "A senha deve possuir no mínimo 8 caracteres"})
})

export type LoginFormSchema = z.infer<typeof loginSchema>;