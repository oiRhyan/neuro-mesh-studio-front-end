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
import Google from '../../../public/image/google-login.png'
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
import RegisterUser from '@/app/services/UserService';
import { toast } from 'sonner';
import { LoginRequestForm } from '@/types/Authorization.type';
import { useAuthorization } from '@/hooks/useAuthorizationUser';

export default function Login() {

   const router: AppRouterInstance = useRouter();
   const [seePassword, setSeePassword] = useState<boolean>(false);
   const [imageProfile, setImageProfile] = useState<string | null>(null);
   const [isRegisterForm, setRegisterForm] = useState<boolean>(false);
   const [form, setForm] = useState<RegisterUserForm>({
      Name: "",
      Email: "",
      Password: "",
      Biography: "",
      ImageProfile: null as unknown as File,
      ImageBanner: null as unknown as File,
   });

   const [loginForm, setLoginForm] = useState<LoginRequestForm>({
      email: "",
      password: ""
   });

   const { login  } = useAuthorization(router);

   const Icon = seePassword ? FaRegEyeSlash : FaRegEye

   const handleImageChange = (
      event: React.ChangeEvent<HTMLInputElement>
   ) => {
      const file = event.target.files?.[0];
      if (!file) return;
      setImageProfile(URL.createObjectURL(file));
      setForm((prev) => ({
         ...prev,
         ImageProfile: file,
      }));
   };

   const handleRegisterForm = (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
   ) => {
      const { name, value } = event.target;
      setForm((prev) => ({
         ...prev,
         [name]: value,
      }));
   };

   const handleLoginForm = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = event.target;
      setLoginForm((prev) => ({
         ...prev,
         [name]: value,
      }));
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
                        />
                        <div className='flex flex-col justify-center items-center gap-3 w-130'>
                           <Field className='content-fields'>
                              <FieldLabel htmlFor="input-field-username" className='input-text-size'> E-mail </FieldLabel>
                              <Input
                                 id="input-field-username"
                                 type="text"
                                 name='Email'
                                 value={form.Email}
                                 onChange={handleRegisterForm}
                                 className='input-validation'
                                 placeholder=""
                              />
                           </Field>
                           <Field className='content-fields'>
                              <FieldLabel htmlFor="inline-end-input" className='input-text-size'>Senha</FieldLabel>
                              <InputGroup className='input-validation'>
                                 <InputGroupInput
                                    id="inline-end-input"
                                    type={seePassword ? "text" : "password"}
                                    name='Password'
                                    onChange={handleRegisterForm}
                                    value={form.Password}
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
                           </Field>
                        </div>
                     </div>
                     <Field className='content-fields'>
                        <FieldLabel htmlFor="input-field-username" className='input-text-size'> Nome Completo </FieldLabel>
                        <Input
                           id="input-field-username"
                           type="text"
                           name='Name'
                           value={form.Name}
                           onChange={handleRegisterForm}
                           className='input-validation'
                           placeholder=""
                        />
                     </Field>
                     <Field className='content-fields mb-2'>
                        <FieldLabel htmlFor="input-field-username" className='input-text-size'> Biografia resumida </FieldLabel>
                        <Input
                           id="input-field-username"
                           type="text"
                           name='Biography'
                           value={form.Biography}
                           onChange={handleRegisterForm}
                           className='input-validation'
                           placeholder=""
                        />
                     </Field>
                     <Button variant={"default"} disabled={registerUser.isPending} type={'button'} onClick={() => registerUser.mutate(form)} title='Register' className='bg-white text-black w-50 h-15 text-1xl hover:bg-purple-600 hover:text-white'>
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
                     <Field className='content-fields'>
                        <FieldLabel htmlFor="input-field-username" className='input-text-size'> E-mail</FieldLabel>
                        <Input
                           id="input-field-username"
                           type="text"
                           name='email'
                           onChange={handleLoginForm}
                           className='input-validation'
                           placeholder=""
                        />
                     </Field>
                     <Field className='content-fields'>
                        <FieldLabel htmlFor="inline-end-input" className='input-text-size'>Senha</FieldLabel>
                        <InputGroup className='input-validation'>
                           <InputGroupInput
                              id="inline-end-input"
                              name='password'
                              onChange={handleLoginForm}
                              type={seePassword ? "text" : "password"}
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
                        className='bg-white text-black w-50 h-15 text-1xl hover:bg-purple-600 hover:text-white mb-4'
                        onClick={async () => {
                           await login(loginForm);
                        }}
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