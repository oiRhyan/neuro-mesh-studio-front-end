import z from 'zod'

export const registerUserSchema = z.object({
    name: z.string().min(1, {message: 'Nome deve ter mais de um caractere'}),
    email: z.string().min(4).min(1, { message: 'O e-mail é obrigatório' }).email({ message: 'Digite um e-mail válido' }),
    password: z.string().min(8, {message: "A senha deve possuir no mínimo 8 caracteres"}),
    imageProfile: z.file({message: 'Adicione uma imagem de perfil'}).nullable(),
    biography: z.string().min(10, {message: "Sua descrição deve ter no minimo caracteres"}).max(20, {message: "Número maximo de caracteres atingido"})
})

export type RegisterUserSchema = z.infer<typeof registerUserSchema>;