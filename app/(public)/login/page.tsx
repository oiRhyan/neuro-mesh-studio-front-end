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
import { JSX, useState } from 'react';
import { IconType } from 'react-icons/lib';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export default function Login() {

   const router: AppRouterInstance = useRouter();
   const [seePassword, setSeePassword] = useState<boolean>(false);
   const [imageProfile, setImageProfile] = useState<string>("/image/select-perfil.png");
   const [isRegisterForm, setRegisterForm] = useState<boolean>(false);
   const Icon = seePassword ? FaRegEyeSlash : FaRegEye

   const handleImageChange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
         setImageProfile(URL.createObjectURL(file));
      }
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
                           <Avatar className="size-35 m-0 left-20">
                              <AvatarImage
                                 src={imageProfile}
                                 alt="profile-image"
                                 className="grayscale"
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
                        <div className='flex flex-col justify-center items-center gap-2.5 w-160'>
                           <Field className='content-fields'>
                              <FieldLabel htmlFor="input-field-username" className='input-text-size'> E-mail </FieldLabel>
                              <Input
                                 id="input-field-username"
                                 type="text"
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
                           className='input-validation'
                           placeholder=""
                        />
                     </Field>
                     <Field className='content-fields mb-2'>
                        <FieldLabel htmlFor="input-field-username" className='input-text-size'> Biografia resumida </FieldLabel>
                        <Input
                           id="input-field-username"
                           type="text"
                           className='input-validation'
                           placeholder=""
                        />
                     </Field>
                     <FieldGroup className="mx-auto w-145 mb-2">
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
                     <Button variant={"default"} type={'button'} title='Login' className='bg-white text-black w-50 h-15 text-1xl hover:bg-purple-600 hover:text-white'>
                        Cadastrar
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
                     <FieldGroup className="mx-auto w-145">
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
                        className='bg-white text-black w-50 h-15 text-1xl hover:bg-purple-600 hover:text-white'
                        onClick={() => {
                           router.push('/home');
                        }}
                     >
                        Login
                     </Button>
                     <div className='w-[20%]'>
                        <div className="flex items-center justify-center gap-5">
                           <Separator className='w-5xl' />
                           <span className="text-sm text-muted-foreground">
                              OU
                           </span>
                           <Separator className='w-5xl' />
                        </div>
                     </div>
                     <button>
                        <Image src={Google} alt='login' height={65} />
                     </button>
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