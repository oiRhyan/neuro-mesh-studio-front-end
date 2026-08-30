'use client'
import '../../style.scss';
import {
   Field,
   FieldDescription,
   FieldSet,
   FieldLabel,
   FieldGroup
} from "@/components/ui/field"
import {
   InputGroup,
   InputGroupAddon,
   InputGroupInput,
} from "@/components/ui/input-group"
import {
   Button
} from '@/components/ui/button'
import {
   Separator
} from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from "@/components/ui/input"
import Image from 'next/image';
import Models from '../../../public/image/pikachu_remake.png';
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
import { useState } from 'react';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useMutation } from '@tanstack/react-query';
import { RegisterUserForm } from '@/types/User.type';
import { toast } from 'sonner';
import { LoginRequestForm } from '@/types/Authorization.type';
import { useAuthorization } from '@/hooks/useAuthorizationUser';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/types/schemas/login.schema';
import z from 'zod';
import { registerUserSchema, RegisterUserSchema } from '@/types/schemas/register.schema';
import { RegisterUser } from '@/app/services/UserService';
import Cookies from 'js-cookie';

type LoginUserRequestForm = z.infer<typeof loginSchema>

export default function Login() {
   const router: AppRouterInstance = useRouter();
   const [seePassword, setSeePassword] = useState<boolean>(false);
   const [imageProfile, setImageProfile] = useState<string | null>(null);
   const [isRegisterForm, setRegisterForm] = useState<boolean>(false);
   const registerFrom = useForm<RegisterUserSchema>({
      resolver: zodResolver(registerUserSchema),
      defaultValues: {
         name: '',
         email: '',
         password: '',
         imageProfile: null,
         biography: ''
      }
   })
   const loginForm = useForm<LoginUserRequestForm>({
      resolver: zodResolver(loginSchema),
      defaultValues: {
         email: '',
         password: ''
      }
   });

   const { register, handleSubmit, formState: { errors } } = loginForm;
   const { register: inputRegister, handleSubmit: handleRegister, formState: { errors: registerErrors }, watch, setValue } = registerFrom;
   const { login, isLoading } = useAuthorization(router);

   const Icon = seePassword ? FaRegEyeSlash : FaRegEye

   const handleImageChange = (
      event: React.ChangeEvent<HTMLInputElement>
   ) => {
      const file = event.target.files?.[0];
      if (!file) return;
      setImageProfile(URL.createObjectURL(file));
      setValue("imageProfile", file, {
         shouldValidate: true
      });
   };

   const onLoginSucess = async (data: LoginUserRequestForm) => {
      console.log("[LoginForm] Dados validados, chamando API");

      Cookies.remove("access-token", { path: '/' });
      Cookies.remove("user", { path: '/' });

      const formData: LoginRequestForm = {
         email: data.email,
         password: data.password
      }

      try {
         const response = await login(formData)

         if (response) {
            console.log("[LoginForm] Usuário logado");
         }
      } catch (e) {
         console.log(e);
      }
   }

   const onLoginError = (formErrors: typeof errors) => {
      console.log(`[LoginForm] Erro no formulário: ${formErrors}`);
   }

   const registerUser = useMutation({
      mutationFn: async (body: RegisterUserForm) => {
         const req = await RegisterUser(body);
         return req.Id;
      },
      onSuccess: () => {
         toast.success("Sucesso ao cadastrar conta!");
         setRegisterForm(false);
      },
      onError: (error: Error) => {
         toast.error("Erro ao criar conta", {
            description: error.message
         });
      }
   });

   const onRegisterSuccess = async (data: RegisterUserSchema) => {
      console.log("[Register Form] Dados validados, chamando cadastro");

      const registerData: RegisterUserForm = {
         Name: data.name,
         Email: data.email,
         Password: data.password,
         ImageProfile: data.imageProfile ?? null,
         Biography: data.biography,
         ImageBanner: null
      }

      try {
         await registerUser.mutateAsync(registerData)
      } catch (e) {
         console.log(e);
      }
   }

   const onRegisterError = async (formError: typeof registerErrors) => {
      console.log(`[Register Form] Erro ao cadastrar formulário ${formError}`);
   }

   return (
      <main className='main-login'>
         <div className='content-login'>
            <Image src={Models} alt='background' height={780} />
            <div className='content-input'>
               {isRegisterForm ? (
                  <div className='justify-center items-center w-[46%] flex flex-col gap-2 absolute top-0.5 bottom-0.5'>
                     <h1> CADASTRO </h1>
                     <h2 className='mb-2'> Registre seu perfil agora mesmo! Após isso você poderar realizar login</h2>
                     <div className='flex flex-row items-center justify-center'>
                        <label htmlFor="profile-upload" className="cursor-pointer">
                           <Avatar className="size-35 m-0 left-18">
                              <AvatarImage
                                 src={imageProfile ?? "/image/select-perfil.png"}
                                 alt="profile-image"
                              />
                           </Avatar>
                        </label>
                        <input
                           id="profile-upload"
                           type="file"
                           accept="image/*"
                           className="hidden"
                           onChange={handleImageChange}
                           aria-invalid={!!registerErrors.imageProfile}
                        />
                        <div className='flex flex-col justify-center items-center gap-3 w-130'>
                           <Field className='content-fields' data-invalid={!!registerErrors.email}>
                              <FieldLabel htmlFor="input-field-register-email" className='input-text-size'> E-mail </FieldLabel>
                              <Input
                                 id="input-field-register-email"
                                 type="text"
                                 {...inputRegister('email')}
                                 className='input-validation'
                                 aria-invalid={!!registerErrors.email}
                                 placeholder=""
                              />
                              {registerErrors.email && (
                                 <FieldDescription>
                                    {registerErrors.email.message}
                                 </FieldDescription>
                              )}
                           </Field>
                           <Field className='content-fields' data-invalid={!!registerErrors.password}>
                              <FieldLabel htmlFor="input-field-register-password" className='input-text-size'>Senha</FieldLabel>
                              <InputGroup className='input-validation'>
                                 <InputGroupInput
                                    id="input-field-register-password"
                                    type={seePassword ? "text" : "password"}
                                    {...inputRegister("password")}
                                    aria-invalid={!!registerErrors.password}
                                    placeholder=""
                                 />
                                 <InputGroupAddon align="inline-end">
                                    <button
                                       type="button"
                                       onClick={() => setSeePassword(!seePassword)}
                                    >
                                       <Icon className='icon' />
                                    </button>
                                 </InputGroupAddon>
                              </InputGroup>
                              {registerErrors.password && (
                                 <FieldDescription>
                                    {registerErrors.password.message}
                                 </FieldDescription>
                              )}
                           </Field>
                        </div>
                     </div>
                     <Field className='content-fields' data-invalid={!!registerErrors.name}>
                        <FieldLabel htmlFor="input-field-register-username" className='input-text-size'> Nome Completo </FieldLabel>
                        <Input
                           id="input-field-register-username"
                           type="text"
                           {...inputRegister('name')}
                           className='input-validation'
                           aria-invalid={!!registerErrors.name}
                           placeholder=""
                        />
                        {registerErrors.name && (
                           <FieldDescription>
                              {registerErrors.name.message}
                           </FieldDescription>
                        )}
                     </Field>
                     <Field className='content-fields mb-2' data-invalid={!!registerErrors.biography}>
                        <FieldLabel htmlFor="input-field-register-biography" className='input-text-size'> Biografia resumida </FieldLabel>
                        <Input
                           id="input-field-register-biography"
                           type="text"
                           {...inputRegister('biography')}
                           className='input-validation'
                           placeholder=""
                           aria-invalid={!!registerErrors.biography}
                        />
                        {registerErrors.biography && (
                           <FieldDescription>
                              {registerErrors.biography.message}
                           </FieldDescription>
                        )}
                     </Field>
                     <Button variant={"default"} disabled={registerUser.isPending} type={'button'} onClick={handleRegister(onRegisterSuccess, onRegisterError)} title='Register' className='bg-white text-black w-50 h-15 text-1xl hover:bg-purple-600 hover:text-white'>
                        {registerUser.isPending
                           ? "Cadastrando..."
                           : "Cadastrar"}
                     </Button>
                     <div className='w-[20%]'>
                        <div className="flex items-center justify-center gap-5">
                           <Separator className='w-5xl' />
                           <span className="text-sm text-muted-foreground">
                              Ou
                           </span>
                           <Separator className='w-5xl' />
                        </div>
                     </div>
                     <FieldSet>
                        <FieldDescription>
                           Já possuí uma conta?{"   "}
                           <a href="#" onClick={() => {
                              setRegisterForm(false)
                           }} className='text-blue-400'>Login</a>
                        </FieldDescription>
                     </FieldSet>
                  </div>
               ) : (
                  <>
                     <h1> ENTRE COM SUA CONTA </h1>
                     <h2> Bem-vindo de volta! Faça login em
                        sua conta para acessar o Studio</h2>
                     <Field className='content-fields' data-invalid={!!errors.email}>
                        <FieldLabel htmlFor="input-field-user-email-login" className='input-text-size'> E-mail</FieldLabel>
                        <Input
                           id="input-field-user-email-login"
                           type="text"
                           {...register('email')}
                           className='input-validation'
                           aria-invalid={!!errors.email}
                           placeholder=""
                        />
                        {errors.email && (
                           <FieldDescription>
                              {errors.email.message}
                           </FieldDescription>
                        )}
                     </Field>
                     <Field className='content-fields' data-invalid={!!errors.password}>
                        <FieldLabel htmlFor="inline-end-input" className='input-text-size'>Senha</FieldLabel>
                        <InputGroup className='input-validation'>
                           <InputGroupInput
                              id="inline-end-input"
                              {...register('password')}
                              type={seePassword ? "text" : "password"}
                              aria-invalid={!!errors.password}
                              placeholder=""
                           />
                           <InputGroupAddon align="inline-end">
                              <button
                                 type="button"
                                 onClick={() => setSeePassword(!seePassword)}
                              >
                                 <Icon className='icon' />
                              </button>
                           </InputGroupAddon>
                        </InputGroup>
                        {errors.password && (
                           <FieldDescription>
                              {errors.password.message}
                           </FieldDescription>
                        )
                        }
                     </Field>
                     <FieldGroup className="mx-auto w-115 mt-5 mb-5">
                        <Field orientation="horizontal">
                           <Checkbox
                              id="terms-checkbox-invalid"
                              name="terms-checkbox-invalid"
                              className='h-6 w-6'
                           />
                           <FieldLabel htmlFor="terms-checkbox-invalid" className='text-1xl'>
                              Lembre de mim
                           </FieldLabel>
                        </Field>
                     </FieldGroup>
                     <Button
                        variant={"default"}
                        type={'button'}
                        title='Login'
                        disabled={isLoading}
                        className='bg-white text-black w-50 h-15 text-1xl hover:bg-purple-600 hover:text-white mb-4'
                        onClick={handleSubmit(onLoginSucess, onLoginError)}
                     >
                        Login
                     </Button>
                     <div className='w-[20%] mb-4'>
                        <div className="flex items-center justify-center gap-5">
                           <Separator className='w-5xl' />
                           <span className="text-sm text-muted-foreground">
                              OU
                           </span>
                           <Separator className='w-5xl' />
                        </div>
                     </div>
                     <FieldSet>
                        <FieldDescription>
                           Ainda não possuí uma conta?{"   "}
                           <a href="#" onClick={() => {
                              setRegisterForm(true)
                           }} className='text-blue-400'>Cadastrar</a>
                        </FieldDescription>
                     </FieldSet>
                  </>
               )}
            </div>
         </div>
      </main>
   )
}