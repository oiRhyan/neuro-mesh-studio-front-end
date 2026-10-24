'use server'

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LoginRequestForm } from '@/types/Authorization.type';
import { AuthorizateUser } from '../services/AuthorizationService';
import { RegisterUserForm } from '@/types/User.type';
import { RegisterUser } from '../services/UserService';

interface User {
  id: string,
  userName: string,
  imageProfile: string,
  banner: string,
  biography: string
}

export async function loginAction(formData: LoginRequestForm) {
    try {
       console.log("Calling API");
       const response = await AuthorizateUser(formData);
       const { token, user } = response;
       const cookieStore = await cookies();
       cookieStore.set('session_token', token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 8,
       });
      cookieStore.set("user", JSON.stringify(user),
          {
            maxAge: 60 * 60 * 8,
            sameSite: "strict",
            path: "/",
            httpOnly: false
          }
      );
    } catch(error: any) {
      return {
          success: false,
          error: error.response?.data?.error ?? 'Falha na autenticação'
      };
    }

    redirect('/home');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('session_token');
  cookieStore.delete('user');
  redirect('/login');
}

export async function registerUserAction(formData: RegisterUserForm) {
    try {
        const response = await RegisterUser(formData);

        if(response.Id) {
          return {
            success: true,
            id: response.Id
          };
        }
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error ?? 'Erro ao cadastrar usuário'
        };
    }
}